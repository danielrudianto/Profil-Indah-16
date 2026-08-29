import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';

export interface RingkasanPiutang {
  total: number;
  invoices: number;
  customers: number;
  overdueValue: number;
  overdueInvoices: number;
  oldestDays: number;
}

/**
 * Kartu piutang — dipakai dasbor penjualan DAN administrator.
 *
 * Satu komponen, bukan dua salinan: dua kartu yang menghitung piutang dengan
 * caranya masing-masing adalah cara tercepat membuat dua halaman saling
 * membantah tentang uang yang sama.
 *
 * Yang ditonjolkan bukan totalnya, melainkan berapa yang SUDAH LEWAT JATUH
 * TEMPO. Total naik-turun sepanjang hari dan itu wajar; yang lewat tempo
 * adalah uang yang seharusnya sudah kembali.
 */
@Component({
  selector: 'app-receivable-card',
  templateUrl: './receivable-card.component.html',
  styleUrls: ['./receivable-card.component.scss'],
  imports: [NgIf, DecimalPipe, TranslatePipe, MatTooltip],
})
export class ReceivableCardComponent {
  constructor(private router: Router) {}

  @Input() data: RingkasanPiutang | null = null;

  get total(): number {
    return Number(this.data?.total ?? 0);
  }

  get lewatTempo(): number {
    return Number(this.data?.overdueValue ?? 0);
  }

  /** Sisanya: sudah ditagihkan, tetapi tenggatnya memang belum sampai. */
  get belumJatuh(): number {
    return Math.max(this.total - this.lewatTempo, 0);
  }

  /**
   * Lebar bagian lewat tempo, dalam persen.
   *
   * Diberi lantai 2% ketika ada isinya supaya nominal kecil tetap terlihat —
   * batang setipis nol memberi kesan tidak ada yang lewat tempo, padahal ada.
   */
  get persenLewat(): number {
    if (this.total <= 0 || this.lewatTempo <= 0) {
      return 0;
    }
    return Math.max((this.lewatTempo / this.total) * 100, 2);
  }

  buka(): void {
    this.router.navigate(['/Receivable']);
  }
}
