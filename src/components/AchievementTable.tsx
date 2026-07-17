import { useState, useMemo } from "react";
import { Search, Calendar, ChevronDown, Trash2, ArrowUpDown, Tag, Info, SlidersHorizontal, Download } from "lucide-react";
import { Achievement } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AchievementTableProps {
  achievements: Achievement[];
  onDelete: (id: string) => void;
  isSyncing: boolean;
}

export default function AchievementTable({ achievements, onDelete, isSyncing }: AchievementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = ["Semua", "Akademik", "Olahraga", "Seni", "Keagamaan", "Non-Akademik", "Lainnya"];

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "Akademik": return "📚";
      case "Olahraga": return "🏆";
      case "Seni": return "🎵";
      case "Keagamaan": return "🧭";
      case "Non-Akademik": return "🤝";
      case "Lainnya": return "✨";
      default: return "🏅";
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "Akademik": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Olahraga": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Seni": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "Keagamaan": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Non-Akademik": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Lainnya": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-800";
    }
  };

  // Filter and Search logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      const matchesSearch =
        ach.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ach.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "Semua" || ach.jenisPrestasi === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [achievements, searchTerm, selectedCategory]);

  // Sorting logic
  const sortedAchievements = useMemo(() => {
    const list = [...filteredAchievements];
    return list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      }
      if (sortBy === "name_asc") {
        return a.namaSiswa.localeCompare(b.namaSiswa);
      }
      if (sortBy === "name_desc") {
        return b.namaSiswa.localeCompare(a.namaSiswa);
      }
      return 0;
    });
  }, [filteredAchievements, sortBy]);

  // Format Date to Indonesian style (e.g., 2 Juli 2026)
  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (achievements.length === 0) return;
    
    // CSV Header
    const headers = ["No", "Nama Siswa", "Jenis Prestasi", "Tanggal Prestasi", "Deskripsi Prestasi"];
    const rows = achievements.map((ach, index) => [
      index + 1,
      `"${ach.namaSiswa.replace(/"/g, '""')}"`,
      ach.jenisPrestasi,
      ach.tanggal,
      `"${ach.deskripsi.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jurnal_prestasi_siswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="achievement-table-container" className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-semibold text-slate-100 text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-950 border border-blue-900/40 text-blue-400 rounded-lg">
              📋
            </span>
            Daftar Jurnal Prestasi
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Menampilkan {filteredAchievements.length} dari {achievements.length} total prestasi terdaftar.
          </p>
        </div>

        {/* Export Button */}
        {achievements.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-slate-100 border border-slate-800 rounded-xl transition-all cursor-pointer w-full md:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor ke CSV / Excel</span>
          </button>
        )}
      </div>

      {/* Search and Filters panel */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-7 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari nama siswa atau kata kunci prestasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs md:text-sm transition-all outline-hidden text-slate-200 placeholder:text-slate-600"
            />
          </div>

          {/* Sorter */}
          <div className="md:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <ArrowUpDown className="w-4 h-4" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 focus:bg-slate-950 focus:border-blue-500 rounded-xl text-xs md:text-sm transition-all outline-hidden text-slate-200 appearance-none"
            >
              <option value="newest">Tanggal Terbaru ➔ Terlama</option>
              <option value="oldest">Tanggal Terlama ➔ Terbaru</option>
              <option value="name_asc">Nama Siswa (A - Z)</option>
              <option value="name_desc">Nama Siswa (Z - A)</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Category tags/pills scrollable list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Saring:
          </span>
          {categories.map((cat) => {
            const count = cat === "Semua" 
              ? achievements.length 
              : achievements.filter(a => a.jenisPrestasi === cat).length;
              
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-900/30"
                    : "bg-slate-950/60 hover:bg-slate-900 text-slate-400 border-slate-850"
                }`}
              >
                <span>{cat !== "Semua" && getCategoryEmoji(cat)} {cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/25 text-white" : "bg-slate-900 text-slate-500 font-normal"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isSyncing && (
        <div className="flex items-center justify-center gap-2 py-3 bg-blue-950/20 border border-blue-900/30 text-blue-300 text-xs rounded-xl mb-4 animate-pulse">
          <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Sinkronisasi dengan Google Sheets...</span>
        </div>
      )}

      {/* Main Table / Grid View */}
      {sortedAchievements.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
          <div className="text-4xl mb-3">🔍</div>
          <h4 className="text-sm font-semibold text-slate-300">Tidak ada jurnal ditemukan</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto px-4 leading-relaxed">
            {searchTerm 
              ? `Tidak ada hasil pencarian yang cocok dengan "${searchTerm}". Coba kata kunci lain.`
              : `Belum ada prestasi siswa yang terdaftar di kategori "${selectedCategory}". Tambahkan jurnal baru di atas.`}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden border border-slate-800/80 rounded-xl bg-slate-950/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest w-[18%]">
                    Siswa
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest w-[15%]">
                    Kategori
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest w-[15%]">
                    Tanggal
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Keterangan
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest w-[10%] text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                <AnimatePresence mode="popLayout">
                  {sortedAchievements.map((ach) => (
                    <motion.tr
                      key={ach.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="hover:bg-blue-900/10 transition-colors group"
                    >
                      {/* Nama Siswa */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-display font-semibold text-slate-200 text-sm">
                          {ach.namaSiswa}
                        </div>
                      </td>

                      {/* Jenis Prestasi Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 w-fit ${getCategoryBadgeClass(ach.jenisPrestasi)}`}>
                          <span>{getCategoryEmoji(ach.jenisPrestasi)}</span>
                          <span>{ach.jenisPrestasi}</span>
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatIndonesianDate(ach.tanggal)}</span>
                        </div>
                      </td>

                      {/* Deskripsi */}
                      <td className="px-5 py-4 text-slate-300 text-xs leading-relaxed max-w-xs md:max-w-md">
                        <p className="line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                          {ach.deskripsi}
                        </p>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {confirmDeleteId === ach.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onDelete(ach.id)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(ach.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition-colors cursor-pointer inline-flex items-center"
                            title="Hapus data prestasi ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile List View (Rule 4: "Pastikan tampilan selalu rapi dan responsif di perangkat mobile.") */}
          <div className="block md:hidden space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedAchievements.map((ach) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-slate-950/30 hover:bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-display font-bold text-slate-200 text-sm">
                        {ach.namaSiswa}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatIndonesianDate(ach.tanggal)}</span>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold shrink-0 flex items-center gap-1 ${getCategoryBadgeClass(ach.jenisPrestasi)}`}>
                      <span>{getCategoryEmoji(ach.jenisPrestasi)}</span>
                      <span>{ach.jenisPrestasi}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-xs leading-relaxed bg-slate-950 border border-slate-850 rounded-lg p-2.5">
                    {ach.deskripsi}
                  </p>

                  {/* Delete Option */}
                  <div className="flex items-center justify-end border-t border-slate-800/40 pt-2.5">
                    {confirmDeleteId === ach.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-red-400 font-medium">Hapus jurnal ini?</span>
                        <button
                          onClick={() => onDelete(ach.id)}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(ach.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-[11px] font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Jurnal</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Sync tip */}
      <div className="mt-4 bg-slate-950/40 border border-slate-850 rounded-xl p-3 flex gap-2 text-slate-400 text-[11px] items-center">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          Semua data tersimpan otomatis di penyimpanan lokal browser Anda. Jika Anda menghubungkan Google Sheets, data akan tersinkronisasi di kedua tempat secara real-time.
        </span>
      </div>
    </div>
  );
}
