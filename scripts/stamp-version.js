/*
  Menulis assets/version.json ke dalam HASIL BUILD, bukan ke src/.

  Dijalankan sebagai `postbuild` — SESUDAH ng build, bukan sebelum. Alasannya
  ada pada isinya: penanda buildnya diambil dari nama berkas main-<hash>.js,
  dan hash itu baru ada setelah bundelnya jadi. Hash berbasis ISI, sehingga
  dua deploy dari kode yang sama menghasilkan penanda yang sama dan aplikasi
  tidak menyuruh siapa pun memuat ulang tanpa alasan.

  Karena ditulis langsung ke dist/, berkas ini tidak pernah masuk git dan
  tidak perlu diabaikan .gitignore.
*/
const fs = require("fs");
const path = require("path");

const akar = path.join(__dirname, "..");
const paket = require(path.join(akar, "package.json"));
const keluaran = path.join(akar, "dist", paket.name, "browser");
const berkasIndex = path.join(keluaran, "index.html");

if (!fs.existsSync(berkasIndex)) {
  console.error(`[stamp-version] index.html tidak ada di ${keluaran}`);
  process.exit(1);
}

const index = fs.readFileSync(berkasIndex, "utf8");
const cocok = index.match(/main-([A-Za-z0-9]+)\.js/);

if (!cocok) {
  console.error("[stamp-version] nama bundel main-<hash>.js tidak ditemukan");
  process.exit(1);
}

const isi = {
  versi: paket.version,
  build: cocok[1],
  dibangun: new Date().toISOString(),
};

const tujuan = path.join(keluaran, "assets");
fs.mkdirSync(tujuan, { recursive: true });
fs.writeFileSync(
  path.join(tujuan, "version.json"),
  JSON.stringify(isi, null, 2) + "\n",
);

console.log(`[stamp-version] v${isi.versi} build ${isi.build}`);
