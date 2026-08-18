import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Peringkat sebuah dimensi laporan — baca saja.
 *
 * Dibuka dari baris "terbaik bulan ini": pemanggil mengirim judul (kunci
 * i18n) dan barisnya {name, value}, terurut dari server. Bar dan persen
 * dihitung terhadap totalnya di sini.
 */
@Component({
  selector: 'app-report-rank',
  templateUrl: './report-rank.component.html',
  styleUrls: ['./report-rank.component.scss'],
  imports: [DialogShellComponent, NgIf, NgFor, DecimalPipe, TranslatePipe],
})
export class ReportRankComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { judul: string; baris: { name: string; value: number }[] },
    private dialogRef: MatDialogRef<ReportRankComponent>,
  ) {}

  inisial(nama: string): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  get total(): number {
    return this.data.baris.reduce((a, b) => a + Number(b.value), 0);
  }

  get terbesar(): number {
    return Math.max(...this.data.baris.map((b) => Number(b.value)), 1);
  }

  lebar(nilai: number): number {
    return Math.max((Number(nilai) / this.terbesar) * 100, 2);
  }

  persen(nilai: number): number {
    return this.total === 0 ? 0 : (Number(nilai) / this.total) * 100;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
