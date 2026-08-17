import { Component } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { AUDITED_ENTITIES } from 'src/app/constants/audit-entity.constant';
import { ActivityEntry } from 'src/app/models/activity-entry.model';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Aktivitas seluruh sistem.
 *
 * Melengkapi kolom created_by/updated_by yang tersimpan di hampir setiap
 * dokumen: kolom itu hanya menyebut siapa yang TERAKHIR menyentuh sebuah baris,
 * sehingga pertanyaan "apa saja yang terjadi hari ini" dan "apa saja yang
 * diubah orang tertentu" tidak bisa dijawab dengan membuka dokumen satu per
 * satu.
 */
@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
  ],
})
export class ActivityComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  readonly entities = AUDITED_ENTITIES;

  entityControl = new FormControl<string>('');
  dateFromControl = new FormControl<Date | null>(null);
  dateToControl = new FormControl<Date | null>(null);

  entries: ActivityEntry[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  isLoading = false;

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

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.fetch(1);
  }

  ngOnInit(): void {
    /*
      Setiap perubahan penyaring mengembalikan tampilan ke halaman pertama.
      Tanpa itu, mempersempit penyaring saat sedang di halaman 8 menghasilkan
      layar kosong — hasilnya memang hanya dua halaman — dan itu terbaca seolah
      tidak ada datanya sama sekali.
    */
    this.entityControl.valueChanges.subscribe(() => this.fetch(1));
    this.dateFromControl.valueChanges.subscribe(() => this.fetch(1));
    this.dateToControl.valueChanges.subscribe(() => this.fetch(1));

    this.fetch(1);
  }

  fetch(page: number): void {
    this.page = page;
    this.isLoading = true;

    const params: Record<string, string | number> = {
      page: this.page,
      page_size: this.pageSize,
    };

    const entity = this.entityControl.value;
    if (entity) params['entity'] = entity;

    /*
      Tanggal dikirim tanpa zona waktu. toISOString() akan menggesernya ke UTC,
      dan di zona waktu Indonesia pergeseran itu memundurkan tanggalnya satu
      hari — seluruh kejadian pagi hari ikut terbuang dari hasil.
    */
    const dari = this.asDateParam(this.dateFromControl.value);
    if (dari) params['dateFrom'] = dari;

    const sampai = this.asDateParam(this.dateToControl.value);
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

  /** Daftar kolom yang berubah, supaya template tidak perlu mengurai objek. */
  daftarPerubahan(entry: ActivityEntry): { field: string; to: unknown }[] {
    if (!entry.changes) return [];
    return Object.entries(entry.changes).map(([field, isi]) => ({
      field,
      to: (isi as { to?: unknown })?.to,
    }));
  }

  private asDateParam(nilai: Date | null): string | null {
    if (!nilai) return null;
    const bulan = `${nilai.getMonth() + 1}`.padStart(2, '0');
    const tanggal = `${nilai.getDate()}`.padStart(2, '0');
    return `${nilai.getFullYear()}-${bulan}-${tanggal}`;
  }
}
