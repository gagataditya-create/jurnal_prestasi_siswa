import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, FileText, Database, Layers, CheckCircle } from "lucide-react";

export default function InstructionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const gasCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Set headers jika spreadsheet masih kosong
  if (sheet.getLastRow() == 0) {
    sheet.appendRow(["Timestamp", "ID", "Nama Siswa", "Jenis Prestasi", "Tanggal", "Deskripsi"]);
  }
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Simpan data baru
    sheet.appendRow([
      new Date(),
      data.id || Utilities.getUuid(),
      data.namaSiswa,
      data.jenisPrestasi,
      data.tanggal,
      data.deskripsi
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "message": "Data berhasil disimpan!" 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "error", 
      "message": err.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Jika kosong, kembalikan array kosong
  if (sheet.getLastRow() < 2) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "data": [] }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
  
  var rows = sheet.getDataRange().getValues();
  var data = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    data.push({
      id: row[1] || String(i),
      namaSiswa: row[2],
      jenisPrestasi: row[3],
      tanggal: row[4] ? (row[4] instanceof Date ? row[4].toISOString().split('T')[0] : String(row[4])) : "",
      deskripsi: row[5],
      timestamp: row[0] ? new Date(row[0]).toLocaleString("id-ID") : ""
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success", "data": data }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader("Access-Control-Allow-Origin", "*");
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="instruction-card" className="bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-transparent hover:from-blue-500/10 transition-all duration-200 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950 border border-blue-900/50 text-blue-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-100 text-sm md:text-base">
              Panduan Integrasi Google Sheets (Opsional)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hubungkan aplikasi ini langsung ke Google Sheets Anda hanya dalam 2 menit.
            </p>
          </div>
        </div>
        <div className="text-blue-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-800 bg-slate-950/30 text-slate-300 text-xs md:text-sm space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-950 border border-blue-800 text-blue-400 rounded-full text-xs font-bold">1</span>
                <span>Buat Spreadsheet</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-medium hover:text-blue-300">sheets.new</a> untuk membuat Google Spreadsheet baru di Google Drive Anda.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-950 border border-blue-800 text-blue-400 rounded-full text-xs font-bold">2</span>
                <span>Buka Apps Script</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Di Spreadsheet Anda, klik menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>. Hapus semua kode default yang ada.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-950 border border-blue-800 text-blue-400 rounded-full text-xs font-bold">3</span>
                <span>Tempel Kode & Deploy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Salin kode di bawah ini, tempel ke Apps Script, klik tombol <strong>Terapkan</strong> &gt; <strong>Penerapan baru</strong>. Pilih tipe <strong>Aplikasi Web</strong>, atur akses ke <strong>"Siapa saja" (Anyone)</strong>, lalu salin URL Web App yang diberikan.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <FileText className="w-4 h-4 text-blue-400" />
                Kode Google Apps Script:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-colors text-xs font-medium cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-60 border border-slate-800">
                {gasCode}
              </pre>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-emerald-200 text-xs">
                Keuntungan Menghubungkan Google Sheets:
              </h4>
              <p className="text-xs text-emerald-400/80 leading-relaxed">
                Semua data jurnal prestasi yang disimpan akan langsung masuk ke spreadsheet Anda secara real-time. Anda bisa membuka spreadsheet tersebut kapan saja untuk mencetak laporan, membagikan data, atau mengolahnya lebih lanjut!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
