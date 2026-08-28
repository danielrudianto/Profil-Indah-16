import { AbstractControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

/**
 * Menghubungkan sepasang isian diskon: Rupiah dan persen.
 *
 * YANG TERSIMPAN SELALU RUPIAH. Persen murni alat isian — payload ketiga
 * halaman pembelian mengirim angka rupiah dan skema server tidak berubah
 * sedikit pun. Supplier menyebut potongannya dalam persen ("diskon 5%"), dan
 * menghitung sendiri lalu mengetik hasilnya adalah tempat orang salah ketik.
 *
 * Ditaruh di utilitas karena diskon dokumen muncul di TIGA halaman —
 * penerimaan barang, faktur pembelian, dan konfirmasinya. Menyalin lingkaran
 * pemutus event ke tiga tempat berarti tiga kesempatan salah menuliskannya.
 *
 * @param rupiah        kontrol yang nilainya benar-benar dikirim ke server
 * @param persen        kontrol pendamping, tidak pernah dikirim
 * @param dasar         nilai yang dikenai persen; dibaca ulang tiap hitung
 * @param dasarBerubah  aliran yang menandai dasarnya bergeser (mis. baris
 *                      barang berubah). Saat itu terjadi RUPIAH yang dipegang
 *                      dan persennya yang disesuaikan — angka rupiah itulah
 *                      yang dikirim, jadi ia tidak boleh bergeser sendiri
 *                      hanya karena seseorang menambah satu baris barang.
 */
/*
  Ketelitian yang DITAMPILKAN isian bermask (`separator.2`), dan alasan
  pembulatan di bawah ada sama sekali.

  Menulis 0,00048 ke isian bermask membuat mask memampatkannya menjadi "0" —
  lalu memantulkan nilai itu kembali ke kontrolnya. Pantulan itu terbaca
  sebagai suntingan pengguna, sehingga pasangannya dihitung ulang dari angka
  yang sudah rusak. Gejalanya asimetris dan membingungkan: mengetik PERSEN
  bekerja (2% dari 490.620 = 9.812,4 — sudah pas dua desimal, tak ada yang
  dinormalkan), sementara mengetik RUPIAH selalu berakhir nol, karena
  persennya hampir selalu pecahan panjang.
*/
const DESIMAL = 2;
const bulatkan = (n: number): number =>
  Math.round(n * 10 ** DESIMAL) / 10 ** DESIMAL;

export function sinkronDiskonPersen(
  rupiah: AbstractControl,
  persen: AbstractControl,
  dasar: () => number,
  dasarBerubah?: Observable<unknown>,
  sesudahUbah?: () => void,
): Subscription {
  /*
    Nilai yang TERAKHIR kita tulis sendiri ke tiap kontrol. Perubahan yang
    sama persis dengannya diabaikan: itu gema dari tulisan kita, bukan
    ketikan orang. Penjaga ini memakai NILAI, bukan bendera sesaat, karena
    pantulan mask bisa datang pada giliran berikutnya — bendera sudah keburu
    turun, nilainya tidak.
  */
  let persenDitulis: number | null = null;
  let rupiahDitulis: number | null = null;

  const hitungPersen = (nilai: number): void => {
    const d = dasar();
    const p = bulatkan(d === 0 ? 0 : (nilai * 100) / d);
    persenDitulis = p;
    persen.setValue(p, { emitEvent: false });
  };

  const hitungRupiah = (nilai: number): void => {
    const r = bulatkan((nilai * dasar()) / 100);
    rupiahDitulis = r;
    rupiah.setValue(r, { emitEvent: false });

    /*
      emitEvent: false melewati penandaan kotor, sementara `dirty` kontrol
      rupiah itulah yang dibaca KeluarTanpaSimpanGuard. Tanpa baris ini, orang
      yang hanya menyentuh kolom persen bisa meninggalkan halaman tanpa
      peringatan dan kehilangan suntingannya.
    */
    rupiah.markAsDirty();
    sesudahUbah?.();
  };

  const gema = (nilai: number, ditulis: number | null): boolean =>
    ditulis !== null && Math.abs(nilai - ditulis) < 1e-9;

  const langganan = new Subscription();

  langganan.add(
    rupiah.valueChanges.subscribe((v) => {
      const n = Number(v ?? 0);
      if (gema(n, rupiahDitulis)) return;
      rupiahDitulis = null;
      hitungPersen(n);
    }),
  );
  langganan.add(
    persen.valueChanges.subscribe((v) => {
      const n = Number(v ?? 0);
      if (gema(n, persenDitulis)) return;
      persenDitulis = null;
      hitungRupiah(n);
    }),
  );

  if (dasarBerubah) {
    langganan.add(
      dasarBerubah.subscribe(() => hitungPersen(Number(rupiah.value ?? 0))),
    );
  }

  /* Persen awal dari rupiah yang sudah ada — tanpa ini kolomnya kosong. */
  hitungPersen(Number(rupiah.value ?? 0));

  return langganan;
}

/**
 * Diskon sebagai persen dari harga, untuk DITAMPILKAN.
 *
 * Mengembalikan null bila persennya tidak punya arti — harga nol, diskon nol,
 * atau nilai yang bukan angka. Pemanggil memakai null itu untuk menampilkan
 * tanda pisah dan untuk mengosongkan tooltip, sehingga tidak ada "0,00%" yang
 * menghiasi baris tanpa diskon.
 *
 * Sengaja mengembalikan ANGKA, bukan teks jadi: pemformatan angka di aplikasi
 * ini lewat DecimalPipe, yang mengikuti locale aktif. Merangkai teks di sini
 * berarti memakai titik desimal Inggris di tampilan berbahasa Indonesia.
 */
export function persenDiskon(harga: unknown, diskon: unknown): number | null {
  const h = Number(harga ?? 0);
  const d = Number(diskon ?? 0);

  if (!Number.isFinite(h) || !Number.isFinite(d) || h <= 0 || d <= 0) {
    return null;
  }

  return (d / h) * 100;
}
