import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Mengetahui versi aplikasi yang sedang berjalan, dan apakah sudah ada yang
 * lebih baru di server.
 *
 * PERSOALAN YANG DIPECAHKAN: nama berkas JavaScript Angular ber-hash, tetapi
 * peramban yang sudah membuka aplikasi tidak pernah tahu ada rilis baru sampai
 * seseorang memuat ulang halamannya. Selama ini jalan keluarnya adalah
 * memberitahu orang satu per satu untuk menekan Ctrl+Shift+R — cara yang hanya
 * bekerja kalau ada yang ingat memberitahu.
 *
 * Penandanya diambil dari hash bundel utama, bukan nomor versi di package.json.
 * Nomor versi jarang dinaikkan dan mudah terlupa; hash berubah tepat ketika
 * ISI aplikasinya berubah — tidak lebih sering, tidak lebih jarang. Dua deploy
 * dari kode yang sama karenanya tidak memunculkan ajakan muat ulang palsu.
 * Berkasnya ditulis skrip postbuild; lihat scripts/stamp-version.js.
 *
 * Memakai fetch(), BUKAN HttpClient: permintaannya harus lolos dari singgahan
 * peramban (`cache: 'no-store'`) — hal yang tidak bisa diminta lewat HttpClient
 * — dan sekalian tidak ikut melewati rantai interceptor, yang tidak ada
 * urusannya dengan berkas statis ini.
 */
@Injectable({ providedIn: 'root' })
export class VersionService {
  private static readonly JALUR = 'assets/version.json';

  /** Diperiksa berkala; cukup jarang, karena rilis bukan peristiwa per menit. */
  private static readonly JEDA_MENIT = 10;

  /** Nomor versi untuk ditampilkan; kosong bila berkasnya tidak ada (dev). */
  readonly versi = new BehaviorSubject<string>('');
  readonly dibangun = new BehaviorSubject<Date | null>(null);
  readonly adaVersiBaru = new BehaviorSubject<boolean>(false);

  /** Penanda build yang SEDANG berjalan; pembanding semua pemeriksaan. */
  private buildBerjalan: string | null = null;

  constructor() {
    void this.periksa();

    setInterval(
      () => void this.periksa(),
      VersionService.JEDA_MENIT * 60 * 1000,
    );

    /*
      Diperiksa juga saat tab kembali dilihat. Inilah momen yang paling sering
      tepat: orang meninggalkan tab semalaman, deploy terjadi, lalu mereka
      kembali — menunggu putaran berkala berikutnya berarti menunda kabarnya
      tanpa alasan.
    */
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        void this.periksa();
      }
    });
  }

  muatUlang(): void {
    location.reload();
  }

  private async periksa(): Promise<void> {
    try {
      const jawaban = await fetch(VersionService.JALUR, { cache: 'no-store' });
      if (!jawaban.ok) {
        return;
      }

      const data = await jawaban.json();
      const build = String(data?.build ?? '');
      if (!build) {
        return;
      }

      this.versi.next(String(data?.versi ?? ''));
      this.dibangun.next(data?.dibangun ? new Date(data.dibangun) : null);

      /*
        Pemeriksaan PERTAMA hanya mencatat, tidak pernah mengumumkan. Ia
        menetapkan build mana yang sedang berjalan; membandingkannya dengan
        dirinya sendiri selalu sama, dan tanpa penjaga ini sebuah tab yang baru
        dibuka tepat sesudah deploy akan langsung menyuruh muat ulang padahal
        ia justru sudah memuat yang terbaru.
      */
      if (this.buildBerjalan === null) {
        this.buildBerjalan = build;
        return;
      }

      if (build !== this.buildBerjalan) {
        this.adaVersiBaru.next(true);
      }
    } catch {
      /*
        Sengaja diam. Gagal memeriksa versi bukan sesuatu yang perlu diketahui
        pengguna — jaringan putus sebentar, atau berkasnya memang tidak ada di
        server pengembangan — dan menampilkan galat untuknya hanya kebisingan.
      */
    }
  }
}
