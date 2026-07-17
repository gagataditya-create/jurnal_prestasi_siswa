import React, { useState } from "react";
import { User, Calendar, BookOpen, FileText, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Achievement } from "../types";
import { motion } from "motion/react";

interface AchievementFormProps {
  onSave: (achievement: Omit<Achievement, "id">) => Promise<boolean>;
  isLoading: boolean;
}

export default function AchievementForm({ onSave, isLoading }: AchievementFormProps) {
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisPrestasi, setJenisPrestasi] = useState("Akademik");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [deskripsi, setDeskripsi] = useState("");

  const [validationError, setValidationError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const categories = [
    { value: "Akademik", label: "Akademik", icon: "📚", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "Olahraga", label: "Olahraga", icon: "🏆", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { value: "Seni", label: "Seni & Budaya", icon: "🎵", color: "text-pink-600 bg-pink-50 border-pink-200" },
    { value: "Keagamaan", label: "Keagamaan", icon: "🧭", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { value: "Non-Akademik", label: "Non-Akademik", icon: "🤝", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { value: "Lainnya", label: "Lain-Lain", icon: "✨", color: "text-purple-600 bg-purple-50 border-purple-200" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMsg("");

    // Validation
    if (!namaSiswa.trim()) {
      setValidationError("Nama siswa harus diisi.");
      return;
    }
    if (namaSiswa.trim().length < 2) {
      setValidationError("Nama siswa minimal 2 karakter.");
      return;
    }
    if (!jenisPrestasi) {
      setValidationError("Silakan pilih jenis prestasi.");
      return;
    }
    if (!tanggal) {
      setValidationError("Silakan tentukan tanggal prestasi.");
      return;
    }
    if (!deskripsi.trim()) {
      setValidationError("Deskripsi prestasi harus diisi.");
      return;
    }
    if (deskripsi.trim().length < 5) {
      setValidationError("Berikan deskripsi yang lebih jelas (minimal 5 karakter).");
      return;
    }

    const payload = {
      namaSiswa: namaSiswa.trim(),
      jenisPrestasi,
      tanggal,
      deskripsi: deskripsi.trim(),
    };

    const success = await onSave(payload);
    if (success) {
      setSuccessMsg("Prestasi berhasil disimpan ke jurnal!");
      // Reset Form
      setNamaSiswa("");
      setDeskripsi("");
      setTanggal(new Date().toISOString().split("T")[0]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
    } else {
      setValidationError("Gagal menyimpan data. Silakan coba lagi.");
    }
  };

  return (
    <div id="achievement-form-container" className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />

      <div className="mb-5">
        <h3 className="font-display font-semibold text-slate-100 text-lg flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-950 border border-blue-900/40 text-blue-400 rounded-lg">
            ✍️
          </span>
          Tambah Jurnal Prestasi
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Isi detail prestasi yang diraih oleh siswa secara lengkap di bawah ini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Siswa */}
        <div className="space-y-1.5">
          <label htmlFor="namaSiswa" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
            Nama Lengkap Siswa
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="namaSiswa"
              value={namaSiswa}
              onChange={(e) => setNamaSiswa(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              disabled={isLoading}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm transition-all outline-hidden text-slate-200 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Jenis Prestasi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
            Jenis Prestasi
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setJenisPrestasi(cat.value)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                  jenisPrestasi === cat.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-900/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tanggal Prestasi */}
        <div className="space-y-1.5">
          <label htmlFor="tanggal" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
            Tanggal Prestasi
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              id="tanggal"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              disabled={isLoading}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm transition-all outline-hidden text-slate-200"
            />
          </div>
        </div>

        {/* Deskripsi Prestasi */}
        <div className="space-y-1.5">
          <label htmlFor="deskripsi" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">
            Deskripsi Prestasi & Penghargaan
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 text-slate-500">
              <FileText className="w-4 h-4" />
            </span>
            <textarea
              id="deskripsi"
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail prestasi. Contoh: Juara 1 Lomba Matematika..."
              disabled={isLoading}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm transition-all outline-hidden text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Error Notification */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-start gap-2 text-rose-300 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </motion.div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-start gap-2 text-emerald-300 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white rounded-xl font-display font-semibold text-sm transition-all shadow-lg shadow-blue-900/40 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              {/* Spinner animation */}
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Menyimpan ke Jurnal...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Simpan ke Jurnal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
