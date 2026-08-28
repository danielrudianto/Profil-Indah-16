import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { ActivityEntry } from 'src/app/models/activity-entry.model';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { CircleAvatarComponent } from 'src/app/components/circle-avatar/circle-avatar.component';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { ActivityFilterComponent } from './activity-filter/activity-filter.component';
import { ActivityViewComponent } from './activity-view/activity-view.component';

/**
 * Aktivitas seluruh sistem.
 *
 * Melengkapi kolom created_by/updated_by yang tersimpan di hampir setiap
 * dokumen: kolom itu hanya menyebut siapa yang TERAKHIR menyentuh sebuah baris,
 * sehingga pertanyaan "apa saja yang terjadi hari ini" dan "apa saja yang
 * diubah orang tertentu" tidak bisa dijawab dengan membuka dokumen satu per
 * satu.
 *
 * Bentuknya mengikuti daftar arsip yang lain: saringan lewat dialog
 * corong yang hasilnya tampil sebagai kapsul, dan rincian perubahan
 * dibuka lewat klik baris — bukan dijejalkan ke kolom tabel.
 */
@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    AvatarComponent,
    CircleAvatarComponent,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    TranslatePipe,
  ],
})
export class ActivityComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  entity = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  entries: ActivityEntry[] = [];
  total = 0;
  page = 1;
  pageSize = 10;

  /**
   * Sembunyikan jejak yang bukan perbuatan orang — MENYALA sejak awal.
   *
   * Penjadwal stok minimum menyentuh belasan ribu baris tiap pekan, dan
   * seluruhnya tercatat. Tanpa saringan ini halaman Aktivitas terisi hal yang
   * tidak dilakukan siapa pun, dan pertanyaan yang membuat halaman ini ada —
   * "apa yang dikerjakan orang hari ini" — justru paling sulit dijawab.
   *
   * Pekerjaan latar tetap bisa dilihat dengan mematikannya; ia disembunyikan,
   * bukan dibuang.
   */
  hanyaPengguna = true;
  isLoading = false;

  ngOnInit(): void {
    this.fetch(1);
  }

  /* Kembali ke halaman satu: jumlah barisnya berubah, jadi halaman ke-N lama
     bisa saja sudah tidak ada. */
  alihkanHanyaPengguna(): void {
    this.hanyaPengguna = !this.hanyaPengguna;
    this.fetch(1);
  }

  fetch(page: number): void {
    this.page = page;
    this.isLoading = true;

    const params: Record<string, string | number> = {
      page: this.page,
      page_size: this.pageSize,
    };

    if (this.hanyaPengguna) params['userOnly'] = 'true';

    if (this.entity) params['entity'] = this.entity;

    /*
      Tanggal dikirim tanpa zona waktu. toISOString() akan menggesernya ke UTC,
      dan di zona waktu Indonesia pergeseran itu memundurkan tanggalnya satu
      hari — seluruh kejadian pagi hari ikut terbuang dari hasil.
    */
    const dari = this.asDateParam(this.dateFrom);
    if (dari) params['dateFrom'] = dari;

    const sampai = this.asDateParam(this.dateTo);
    if (sampai) params['dateTo'] = sampai;

    this.apiService.get('audit-logs', params).subscribe({
      next: (res: any) => {
        this.entries = res?.data ?? [];
        this.total = res?.total ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showError(err);
        this.isLoading = false;
      },
    });
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.fetch(1);
  }

  /* ---------------------------------------------------------------- */
  /* Saringan — dialog corong + kapsul, pola arsip                     */
  /* ---------------------------------------------------------------- */

  openFilter(): void {
    this.dialog
      .open(ActivityFilterComponent, {
        data: {
          entity: this.entity,
          dateFrom: this.dateFrom,
          dateTo: this.dateTo,
        },
      })
      .afterClosed()
      .subscribe((hasil) => {
        /* Ditutup lewat latar: tidak mengembalikan apa-apa, biarkan. */
        if (!hasil) return;

        this.entity = hasil.entity ?? '';
        this.dateFrom = hasil.dateFrom ?? null;
        this.dateTo = hasil.dateTo ?? null;
        this.fetch(1);
      });
  }

  get kapsul(): { kunci: string; teks: string }[] {
    const daftar: { kunci: string; teks: string }[] = [];

    if (this.entity) {
      daftar.push({ kunci: 'entity', teks: this.entity });
    }

    if (this.dateFrom || this.dateTo) {
      const teks = `${this.teksTanggal(this.dateFrom) ?? '…'} – ${this.teksTanggal(this.dateTo) ?? '…'}`;
      daftar.push({ kunci: 'tanggal', teks });
    }

    return daftar;
  }

  lepasKapsul(kunci: string): void {
    if (kunci === 'entity') {
      this.entity = '';
    } else {
      this.dateFrom = null;
      this.dateTo = null;
    }
    this.fetch(1);
  }

  hapusSemuaSaringan(): void {
    this.entity = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.fetch(1);
  }

  /* ---------------------------------------------------------------- */
  /* Baris                                                             */
  /* ---------------------------------------------------------------- */

  lihat(entry: ActivityEntry): void {
    this.dialog.open(ActivityViewComponent, { data: entry });
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? 'S').trim().charAt(0).toUpperCase() || 'S';
  }

  kelasTindakan(aksi: string): string {
    if (aksi === 'create') return 'pill--hijau';
    if (aksi === 'delete') return 'pill--merah';
    return 'pill--amber';
  }

  ikonTindakan(aksi: string): string {
    if (aksi === 'create') return 'ph-plus-circle';
    if (aksi === 'delete') return 'ph-x-circle';
    return 'ph-pencil-simple';
  }

  private teksTanggal(nilai: Date | null): string | null {
    if (!nilai) return null;
    return `${nilai.getDate()}/${nilai.getMonth() + 1}/${nilai.getFullYear()}`;
  }

  private asDateParam(nilai: Date | null): string | null {
    if (!nilai) return null;
    const bulan = `${nilai.getMonth() + 1}`.padStart(2, '0');
    const tanggal = `${nilai.getDate()}`.padStart(2, '0');
    return `${nilai.getFullYear()}-${bulan}-${tanggal}`;
  }
}
