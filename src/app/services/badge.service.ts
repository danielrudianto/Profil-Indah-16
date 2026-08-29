import { Injectable, OnDestroy, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface BadgeCounts {
  overpayment: number;
  goodReceipt: number;
  adjustment: number;
}

/**
 * Hitungan pekerjaan yang masih menunggu, untuk lencana di menu samping.
 *
 * DIAMBIL BERKALA, bukan didorong lewat socket. Socket memang sudah ada di
 * sistem ini, tetapi hanya dipakai data master — tidak ada satu pun dokumen
 * yang mengirim peristiwa. Membuat lencana berbasis socket berarti menambahkan
 * emit pada SETIAP jalur yang mengubah ketiganya: buat, konfirmasi, hapus,
 * sampai konversi setoran menjadi faktur. Lupa satu saja, lencananya salah
 * selamanya tanpa satu pun galat.
 *
 * Pengambilan berkala menyembuhkan dirinya sendiri: paling lama keliru satu
 * menit, lalu benar lagi.
 */
@Injectable({ providedIn: 'root' })
export class BadgeService implements OnDestroy {
  private api = inject(ApiService);

  /** Nol, bukan null — sebelum jawaban pertama tiba, tidak ada lencana. */
  counts: BadgeCounts = { overpayment: 0, goodReceipt: 0, adjustment: 0 };

  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly JEDA = 60_000;

  private readonly saatTerlihat = (): void => {
    if (document.visibilityState === 'visible') {
      this.muat();
    }
  };

  mulai(): void {
    if (this.timer !== null) {
      return;
    }

    this.muat();
    this.timer = setInterval(() => this.muat(), this.JEDA);

    /*
      Berhenti ketika tabnya tidak terlihat. Staf meninggalkan aplikasinya
      terbuka seharian; tanpa ini, delapan jam menghitung untuk layar yang
      tidak dilihat siapa pun. Begitu tabnya dibuka lagi, angkanya diambil
      SAAT ITU juga — bukan menunggu giliran berikutnya, karena yang pertama
      dilihat orang setelah kembali adalah menu.
    */
    document.addEventListener('visibilitychange', this.saatTerlihat);
  }

  /** Dipanggil sesudah tindakan yang mengubah salah satu hitungannya. */
  muat(): void {
    if (document.visibilityState === 'hidden') {
      return;
    }

    this.api.get('dashboard/badges').subscribe({
      next: (data: any) => {
        this.counts = {
          overpayment: Number(data?.overpayment ?? 0),
          goodReceipt: Number(data?.goodReceipt ?? 0),
          adjustment: Number(data?.adjustment ?? 0),
        };
      },
      /*
        Gagal mengambil lencana BUKAN alasan mengganggu orang. Ia hiasan yang
        menolong, bukan pekerjaan yang sedang dikerjakan — sebuah snackbar
        merah tiap menit karena jaringan berkedip jauh lebih mengganggu
        daripada angka yang telat semenit.
      */
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    document.removeEventListener('visibilitychange', this.saatTerlihat);
  }
}
