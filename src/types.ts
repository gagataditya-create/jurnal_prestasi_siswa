export interface Achievement {
  id: string;
  namaSiswa: string;
  jenisPrestasi: string;
  tanggal: string;
  deskripsi: string;
  timestamp?: string; // Optional timestamp when recorded
}

export interface WebAppConfig {
  webAppUrl: string;
}
