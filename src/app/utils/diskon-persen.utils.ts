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
export function sinkronDiskonPersen(
  rupiah: AbstractControl,
  persen: AbstractControl,
  dasar: () => number,
  dasarBerubah?: Observable<unknown>,
): Subscription {
  const hitungPersen = (nilai: number): void => {
    const d = dasar();
    persen.setValue(d === 0 ? 0 : (nilai * 100) / d, { emitEvent: false });
  };

  const hitungRupiah = (nilai: number): void => {
    rupiah.setValue((nilai * dasar()) / 100, { emitEvent: false });

    /*
      emitEvent: false melewati penandaan kotor, sementara `dirty` kontrol
      rupiah itulah yang dibaca KeluarTanpaSimpanGuard. Tanpa baris ini, orang
      yang hanya menyentuh kolom persen bisa meninggalkan halaman tanpa
      peringatan dan kehilangan suntingannya.
    */
    rupiah.markAsDirty();
  };

  const langganan = new Subscription();

  langganan.add(
    rupiah.valueChanges.subscribe((v) => hitungPersen(Number(v ?? 0))),
  );
  langganan.add(
    persen.valueChanges.subscribe((v) => hitungRupiah(Number(v ?? 0))),
  );

  if (dasarBerubah) {
    langganan.add(
      dasarBerubah.subscribe(() => hitungPersen(Number(rupiah.value ?? 0))),
    );
  }

  return langganan;
}
