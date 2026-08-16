import { Component, Inject, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog setujui penyesuaian — bagian `12d` berkas desain.
 *
 * Dialog ini ADALAH konfirmasinya: ringkasan kasus, siapa yang membuat,
 * berapa barangnya, lalu banner yang menyatakan akibatnya — begitu disetujui,
 * penyesuaian langsung masuk ke stok dan ikut perhitungan jurnal akuntansi,
 * tanpa bisa dibatalkan. Tidak ada dialog "yakin?" kedua di atasnya.
 */
@Component({
  selector: 'app-adjustment-case-confirm-view',
  templateUrl: './adjustment-case-confirm-view.component.html',
  styleUrls: ['./adjustment-case-confirm-view.component.scss'],
  imports: [
    DialogShellComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class AdjustmentCaseConfirmViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<AdjustmentCaseConfirmViewComponent>,
    private translateService: TranslateService,
    private datePipe: DatePipe,
  ) {}

  isLoading = true;
  isSubmitting = false;
  kasus: any = null;

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`adjustment-case/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.kasus = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get tanggal(): string {
    return this.kasus
      ? (this.datePipe.transform(this.kasus.date, 'dd MMMM yyyy') ?? '—')
      : '—';
  }

  get jumlahBaris(): number {
    return this.kasus?.adjustment_case?.length ?? 0;
  }

  get totalJumlah(): number {
    return (this.kasus?.adjustment_case ?? []).reduce(
      (total: number, baris: any) => total + (Number(baris.quantity) || 0),
      0,
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  setujui(): void {
    this.isSubmitting = true;
    this.apiService
      .post('adjustment-case/approve', {
        id: this.data.id,
      })
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            this.translateService.instant('adjustment-case__confirm__success'),
          );

          this.dialogRef.close(data ?? true);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}
