import { Award, BookOpen, Music, Trophy, Compass, HeartHandshake } from "lucide-react";
import { Achievement } from "../types";
import { motion } from "motion/react";

interface StatCardsProps {
  achievements: Achievement[];
}

export default function StatCards({ achievements }: StatCardsProps) {
  const total = achievements.length;
  const akademik = achievements.filter((a) => a.jenisPrestasi === "Akademik").length;
  const seni = achievements.filter((a) => a.jenisPrestasi === "Seni").length;
  const olahraga = achievements.filter((a) => a.jenisPrestasi === "Olahraga").length;
  const keagamaan = achievements.filter((a) => a.jenisPrestasi === "Keagamaan").length;
  const lainnya = achievements.filter((a) => !["Akademik", "Seni", "Olahraga", "Keagamaan"].includes(a.jenisPrestasi)).length;

  const stats = [
    {
      id: "stat-total",
      label: "Total Prestasi",
      value: total,
      icon: Award,
      gradient: "from-blue-600 to-cyan-500",
      textColor: "text-white",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      borderColor: "border-blue-500/30",
      glowColor: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    },
    {
      id: "stat-akademik",
      label: "Akademik",
      value: akademik,
      icon: BookOpen,
      gradient: "from-slate-900/60 to-slate-900/40",
      textColor: "text-slate-100",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      borderColor: "border-slate-800 hover:border-blue-500/30",
      glowColor: "",
    },
    {
      id: "stat-olahraga",
      label: "Olahraga",
      value: olahraga,
      icon: Trophy,
      gradient: "from-slate-900/60 to-slate-900/40",
      textColor: "text-slate-100",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      borderColor: "border-slate-800 hover:border-amber-500/30",
      glowColor: "",
    },
    {
      id: "stat-seni",
      label: "Seni & Budaya",
      value: seni,
      icon: Music,
      gradient: "from-slate-900/60 to-slate-900/40",
      textColor: "text-slate-100",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-400",
      borderColor: "border-slate-800 hover:border-pink-500/30",
      glowColor: "",
    },
    {
      id: "stat-keagamaan",
      label: "Keagamaan",
      value: keagamaan,
      icon: Compass,
      gradient: "from-slate-900/60 to-slate-900/40",
      textColor: "text-slate-100",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      borderColor: "border-slate-800 hover:border-emerald-500/30",
      glowColor: "",
    },
    {
      id: "stat-lainnya",
      label: "Lain-Lain",
      value: lainnya,
      icon: HeartHandshake,
      gradient: "from-slate-900/60 to-slate-900/40",
      textColor: "text-slate-100",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      borderColor: "border-slate-800 hover:border-purple-500/30",
      glowColor: "",
    },
  ];

  return (
    <div id="stat-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.id}
            id={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className={`relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between border backdrop-blur-md transition-all duration-300 ${
              stat.borderColor
            } bg-gradient-to-br ${stat.gradient} ${stat.glowColor || "shadow-md shadow-slate-950/20"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] md:text-xs font-semibold ${stat.textColor === "text-white" ? "text-white/80" : "text-slate-400"}`}>
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                <IconComponent className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className={`text-2xl md:text-3xl font-display font-bold tracking-tight ${stat.textColor}`}>
                {stat.value}
              </span>
              <span className={`text-[10px] ${stat.textColor === "text-white" ? "text-white/60" : "text-slate-500"}`}>
                item
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
