import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import {
  formatDate,
  NgIf,
  NgFor,
  DecimalPipe,
  DatePipe,
} from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Laporan persediaan — nilai gudang PADA suatu tanggal.
 *
 * Server menghitung sisa tiap lapisan stok pada tanggal itu (kuantitas
 * dikurangi keluaran tertetapkan sampai tanggal tersebut) dan menjumlah
 * harga pokoknya per perusahaan. Keluaran tanpa induk tidak ternilai —
 * ditampilkan sebagai peringatan, bukan diam-diam dianggap nol.
 */
@Component({
  selector: 'app-report-inventory',
  templateUrl: './report-inventory.component.html',
  styleUrls: ['./report-inventory.component.scss'],
  providers: [DatePipe],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatDatepicker,
    MatDatepickerInput,
  ],
})
export class ReportInventoryComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private datePipe: DatePipe,
  ) {}

  isLoading = true;
  localeId = inject(LOCALE_ID);

  date = new FormControl(new Date());

  perusahaan: { id: number; company: string; value: number }[] = [];
  takBernilai = { count: 0, value: 0 };

  /** 12 titik nilai gudang (akhir bulan; titik terakhir = tanggal terpilih). */
  tren: { year: number; month: number; value: number }[] = [];
  merek: { name: string; value: number }[] = [];
  sorotan: { ikon: string; teks: string }[] = [];
  /** Sorotan butuh angka per perusahaan DAN tren; keduanya tiba terpisah. */
  private utamaSiap = false;

  ngOnInit(): void {
    this.ambilData();
    this.date.valueChanges.subscribe(() => this.ambilData());
  }

  get teksTanggal(): string {
    return this.datePipe.transform(this.date.value, 'dd MMM yyyy') ?? '—';
  }

  ambilData(): void {
    this.isLoading = true;
    this.utamaSiap = false;
    this.sorotan = [];
    this.apiService
      .get('report/inventory', {
        date: moment(this.date.value).format('YYYY-MM-DD'),
      })
      .subscribe({
        next: (data: any) => {
          this.perusahaan = data.companies ?? [];
          this.takBernilai = data.unassigned ?? { count: 0, value: 0 };
          this.utamaSiap = true;
          this.susunSorotan();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });

    this.ambilTren();
  }

  private ambilTren(): void {
    this.tren = [];
    this.merek = [];
    this.apiService
      .get('report/inventory/trend', {
        date: moment(this.date.value).format('YYYY-MM-DD'),
      })
      .subscribe({
        next: (data: any) => {
          this.tren = (data.trend ?? []).map((x: any) => ({
            year: Number(x.year),
            month: Number(x.month),
            value: Number(x.value ?? 0),
          }));
          this.merek = (data.brands ?? []).map((x: any) => ({
            name: x.name,
            value: Number(x.value ?? 0),
          }));
          this.susunSorotan();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });
  }

  get total(): number {
    return this.perusahaan.reduce((a, b) => a + Number(b.value), 0);
  }

  persen(nilai: number): number {
    return this.total === 0 ? 0 : (Number(nilai) / this.total) * 100;
  }

  /* ---------------------------------------------------------------- */
  /* Grafik tren nilai gudang                                          */
  /* ---------------------------------------------------------------- */

  private get maksTren(): number {
    return Math.max(...this.tren.map((x) => x.value), 1);
  }

  tinggiTren(b: (typeof this.tren)[number]): number {
    return Math.max(0, (b.value / this.maksTren) * 100);
  }

  labelBulan(b: (typeof this.tren)[number]): string {
    return formatDate(new Date(b.year, b.month - 1, 1), 'MMM', this.localeId);
  }

  bulanPenuh(b: (typeof this.tren)[number]): string {
    return formatDate(new Date(b.year, b.month - 1, 1), 'MMMM y', this.localeId);
  }

  get rentangTren(): string {
    if (this.tren.length === 0) {
      return '';
    }
    const ujung = (b: (typeof this.tren)[number]) =>
      formatDate(new Date(b.year, b.month - 1, 1), 'MMM y', this.localeId);
    return `${ujung(this.tren[0])} – ${ujung(this.tren[this.tren.length - 1])}`;
  }

  /* ---------------------------------------------------------------- */
  /* Sorotan — kalimat yang dihitung dari angka, bukan dikarang        */
  /* ---------------------------------------------------------------- */

  /** "Rp 10,3 M" / "Rp 702 jt" — angka sorotan tak butuh presisi rupiah. */
  private rupiahRingkas(nilai: number): string {
    if (nilai >= 1_000_000_000) {
      return `Rp ${(nilai / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }
    if (nilai >= 1_000_000) {
      return `Rp ${(nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} jt`;
    }
    return `Rp ${nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }

  private susunSorotan(): void {
    if (!this.utamaSiap || this.tren.length < 2) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const hasil: { ikon: string; teks: string }[] = [];
    const angka = (n: number, d = 1) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: d });

    /* 1. Perusahaan yang menyimpan nilai gudang terbesar. */
    if (this.perusahaan.length > 1 && this.total > 0) {
      const juara = this.perusahaan[0];
      hasil.push({
        ikon: 'ph-buildings',
        teks: t('sorotan-inv__perusahaan', {
          nama: juara.company,
          nilai: this.rupiahRingkas(Number(juara.value)),
          persen: angka(this.persen(juara.value)),
        }),
      });
    }

    /* 2. Merek yang paling banyak mengendap di gudang. */
    if (this.merek.length > 0 && this.total > 0 && this.merek[0].value > 0) {
      const juara = this.merek[0];
      hasil.push({
        ikon: 'ph-package',
        teks: t('sorotan-inv__merek', {
          merek: juara.name,
          nilai: this.rupiahRingkas(juara.value),
          persen: angka((juara.value / this.total) * 100),
        }),
      });
    }

    /*
      3. Banding terhadap akhir bulan lalu. Tanpa merah/biru: persediaan
      yang naik bisa berarti siap jualan atau uang mengendap — arahnya
      bukan baik/buruk secara sendirinya, jadi angkanya dibiarkan bicara.
    */
    const kini = this.tren[this.tren.length - 1];
    const lalu = this.tren[this.tren.length - 2];
    if (lalu.value > 0) {
      const persen = ((kini.value - lalu.value) / lalu.value) * 100;
      const stabil = Math.abs(persen) < 0.1;
      hasil.push({
        ikon: stabil
          ? 'ph-equals'
          : persen >= 0
            ? 'ph-trend-up'
            : 'ph-trend-down',
        teks: t(
          stabil
            ? 'sorotan-inv__banding__stabil'
            : persen >= 0
              ? 'sorotan-inv__banding__naik'
              : 'sorotan-inv__banding__turun',
          {
            total: this.rupiahRingkas(kini.value),
            persen: angka(Math.abs(persen)),
            bulanLalu: this.bulanPenuh(lalu),
            totalLalu: this.rupiahRingkas(lalu.value),
          },
        ),
      });
    }

    this.sorotan = hasil;
  }
}
