import { useState, useEffect, FormEvent } from "react";
import { Award, Database, Settings, HelpCircle, RefreshCw, CheckCircle, AlertCircle, Globe, ShieldCheck, HelpCircle as HelpIcon, Sparkles } from "lucide-react";
import { Achievement } from "./types";
import StatCards from "./components/StatCards";
import AchievementForm from "./components/AchievementForm";
import AchievementTable from "./components/AchievementTable";
import InstructionCard from "./components/InstructionCard";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";

export default function App() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [webAppUrl, setWebAppUrl] = useState("");
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Real-time Indonesian clock
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Notification states
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Load configuration and data on component mount
  useEffect(() => {
    // Clock setup
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB");
      setCurrentDate(now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // 1. Load URL Web App Script for Google Sheets
    const savedUrl = localStorage.getItem("jurnal_prestasi_web_app_url");
    if (savedUrl) {
      setWebAppUrl(savedUrl);
    }

    // 2. Real-time Firebase Firestore listener
    setIsLoading(true);
    const q = query(collection(db, "achievements"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAchievements: Achievement[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedAchievements.push({
          id: docSnap.id,
          namaSiswa: data.namaSiswa || "",
          jenisPrestasi: data.jenisPrestasi || "",
          tanggal: data.tanggal || "",
          deskripsi: data.deskripsi || "",
          timestamp: data.timestamp || ""
        });
      });
      setAchievements(fetchedAchievements);
      localStorage.setItem("jurnal_prestasi_data", JSON.stringify(fetchedAchievements));
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore loading error, falling back to localStorage", error);
      // Fallback to local storage if Firebase is blocked/offline
      const savedData = localStorage.getItem("jurnal_prestasi_data");
      if (savedData) {
        try {
          setAchievements(JSON.parse(savedData));
        } catch {
          setAchievements([]);
        }
      } else {
        setAchievements([]);
      }
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, "achievements");
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const triggerToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Save Web App URL
  const handleSaveConfig = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("jurnal_prestasi_web_app_url", webAppUrl.trim());
    setIsSettingOpen(false);
    triggerToast("success", "URL Web App Script berhasil disimpan!");
    
    // Auto sync after saving URL
    if (webAppUrl.trim()) {
      handleSyncWithGoogleSheets(webAppUrl.trim());
    }
  };

  // Sync / Fetch data from Google Sheets Web App Script (GET)
  const handleSyncWithGoogleSheets = async (targetUrl = webAppUrl) => {
    if (!targetUrl.trim()) {
      triggerToast("error", "Harap atur URL Web App Google Sheets terlebih dahulu.");
      setIsSettingOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(targetUrl.trim());
      if (!response.ok) throw new Error("Respons jaringan bermasalah");
      
      const result = await response.json();
      
      if (result.status === "success" && Array.isArray(result.data)) {
        const mergedData = [...result.data];
        setAchievements(mergedData);
        localStorage.setItem("jurnal_prestasi_data", JSON.stringify(mergedData));
        triggerToast("success", `Sinkronisasi berhasil! ${result.data.length} data disinkronkan dari Google Sheets.`);
      } else {
        throw new Error(result.message || "Struktur respon tidak valid.");
      }
    } catch (error) {
      console.error(error);
      triggerToast("error", "Gagal menyelaraskan data dengan Google Sheets.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Save new achievement (Adds to Firestore & triggers POST to Web App Script if configured)
  const handleSaveAchievement = async (newAch: Omit<Achievement, "id">): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. Save to Firebase Firestore
      const docRef = doc(collection(db, "achievements"));
      const itemToSave = {
        namaSiswa: newAch.namaSiswa,
        jenisPrestasi: newAch.jenisPrestasi,
        tanggal: newAch.tanggal,
        deskripsi: newAch.deskripsi,
        timestamp: new Date().toISOString()
      };
      
      await setDoc(docRef, itemToSave);

      // 2. Try Web App Script Post if configured
      if (webAppUrl.trim()) {
        try {
          const itemWithId = { id: docRef.id, ...itemToSave };
          await fetch(webAppUrl.trim(), {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(itemWithId),
          });
          triggerToast("success", "Prestasi berhasil disimpan di Firebase & Google Sheets!");
        } catch (error) {
          console.error("Fetch error to Google Apps Script:", error);
          triggerToast("info", "Disimpan di Firebase. Gagal mengirim ke Google Sheets.");
        }
      } else {
        triggerToast("success", "Prestasi berhasil disimpan di Firebase Database!");
      }
      return true;
    } catch (error) {
      console.error("Firestore Save Error:", error);
      triggerToast("error", "Gagal menyimpan data ke Firebase.");
      handleFirestoreError(error, OperationType.CREATE, "achievements");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Achievement
  const handleDeleteAchievement = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "achievements", id));
      triggerToast("success", "Prestasi berhasil dihapus dari Firebase.");
    } catch (error) {
      console.error("Firestore Delete Error:", error);
      triggerToast("error", "Gagal menghapus prestasi dari Firebase.");
      handleFirestoreError(error, OperationType.DELETE, `achievements/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans selection:bg-blue-500/30 selection:text-white pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none"
          >
            <div className={`p-4 rounded-xl shadow-2xl border text-sm flex items-start gap-3 pointer-events-auto backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-900/20" 
                : toast.type === "error"
                ? "bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-900/20"
                : "bg-blue-950/90 text-blue-100 border-blue-800 shadow-blue-900/20"
            }`}>
              <div className="mt-0.5 shrink-0">
                {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {toast.type === "info" && <Database className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-xs md:text-sm">
                  {toast.type === "success" ? "Berhasil" : toast.type === "error" ? "Kesalahan" : "Pemberitahuan"}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Section */}
      <header className="bg-slate-950/80 border-b border-slate-900 backdrop-blur-md text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-inner border border-white/10 text-white shadow-lg shadow-blue-500/10">
              <Award className="w-7 h-7 animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Dashboard Guru
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Live
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white mt-1">
                Jurnal Prestasi Siswa
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Sistem Pencatatan Prestasi dan Penghargaan Siswa Real-Time
              </p>
            </div>
          </div>

          {/* Clock & Action Buttons */}
          <div className="flex flex-col md:items-end gap-2 shrink-0">
            <div className="text-left md:text-right">
              <p className="text-sm font-display font-semibold text-white/95">{currentTime}</p>
              <p className="text-[11px] text-slate-400">{currentDate}</p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* Database Connection Status Badge */}
              <div className="text-[11px] font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 bg-blue-500/10 text-blue-300 border-blue-500/30 transition-all">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                <span>Firebase Real-Time</span>
              </div>

              {webAppUrl && (
                <div className="text-[11px] font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border-emerald-500/30 transition-all">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sheets Terhubung</span>
                </div>
              )}

              {/* Sync Button */}
              {webAppUrl && (
                <button
                  onClick={() => handleSyncWithGoogleSheets()}
                  disabled={isSyncing}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-colors text-white border border-slate-800 flex items-center justify-center cursor-pointer"
                  title="Sinkronisasi Data"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-cyan-300" : ""}`} />
                </button>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingOpen(!isSettingOpen)}
                className={`p-1.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isSettingOpen 
                    ? "bg-white text-slate-950 border-white" 
                    : "bg-slate-900 hover:bg-slate-800 text-white border-slate-800"
                }`}
                title="Pengaturan Integrasi Google Sheets"
              >
                <Settings className={`w-4 h-4 ${isSettingOpen ? "rotate-90" : ""} transition-transform duration-300`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 flex-1 w-full">
        
        {/* Settings Integration Panel */}
        <AnimatePresence>
          {isSettingOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <h3 className="font-display font-semibold text-base text-slate-100">Konfigurasi Jaringan Google Sheets</h3>
                  </div>
                  <button 
                    onClick={() => setIsSettingOpen(false)}
                    className="text-white/60 hover:text-white text-xs cursor-pointer"
                  >
                    Tutup ✕
                  </button>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="webAppUrl" className="text-xs font-semibold text-slate-300 block">
                      URL Web App Google Apps Script
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        id="webAppUrl"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={webAppUrl}
                        onChange={(e) => setWebAppUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-200 placeholder-slate-600 outline-hidden transition-all font-mono"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-xs md:text-sm transition-all shadow-md cursor-pointer"
                      >
                        Simpan URL
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-550">
                      Masukkan URL Web App yang diperoleh setelah melakukan deploy Apps Script. Kosongkan jika ingin menggunakan penyimpanan lokal.
                    </p>
                  </div>
                </form>

                <div className="border-t border-slate-800 pt-4">
                  <p className="text-xs text-blue-300/90 leading-relaxed">
                    💡 <strong>Tips:</strong> Setelah menyimpan URL Anda, aplikasi akan mencoba mengambil data yang ada dari spreadsheet secara otomatis. Lihat panduan lengkap pembuatan Apps Script di panel panduan di bawah jika Anda belum memilikinya.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Statistics Cards */}
        <StatCards achievements={achievements} />

        {/* Integration Instructions Card */}
        <InstructionCard />

        {/* Main Grid Content: Form (left) + Table (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Input Form (Spans 4 columns on large screens) */}
          <div className="lg:col-span-4 space-y-4">
            <AchievementForm onSave={handleSaveAchievement} isLoading={isLoading} />
            
            {/* Quick school banner decoration */}
            <div className="bg-gradient-to-tr from-slate-900/60 to-slate-900/40 border border-slate-800/85 rounded-2xl p-5 text-slate-300 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute bottom-0 right-0 translate-y-4 translate-x-4 opacity-[0.03]">
                <Sparkles className="w-40 h-40" />
              </div>
              <h4 className="font-display font-semibold text-slate-200 text-sm">Menghargai Setiap Prestasi</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                "Pendidikan bukan hanya tentang mengisi pikiran, tetapi juga menyalakan api kreativitas dan menghargai bakat unik setiap anak."
              </p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                <span>Sekolah Berprestasi, Bangsa Maju</span>
              </div>
            </div>
          </div>

          {/* Right Column: Achievements List (Spans 8 columns on large screens) */}
          <div className="lg:col-span-8">
            <AchievementTable 
              achievements={achievements} 
              onDelete={handleDeleteAchievement} 
              isSyncing={isSyncing} 
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-950 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Jurnal Prestasi Siswa. Dibuat dengan cinta untuk ekosistem pendidikan yang lebih transparan dan produktif.</p>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span className="hover:text-blue-400 transition-colors">Indonesian Language</span>
            <span>•</span>
            <span className="hover:text-blue-400 transition-colors">Google Sheets Connected</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
