import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';

/**
 * Tampilan BACA penyesuaian stok — dokumen, bukan formulir berbaju
 * kolom input. Hapus hanya untuk administrator dan hanya pada dokumen
 * terkonfirmasi yang belum terhapus — aturan lamanya dipertahankan.
 */
@Component({
  selector: 'app-adjustment-case-view',
  templateUrl: './adjustment-case-view.component.html',
  styleUrls: ['./adjustment-case-view.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class AdjustmentCaseViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { id: number; noAction: boolean; print: boolean },
    private authService: AuthService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<AdjustmentCaseViewComponent>,
  ) {}

  isAdministrator = false;
  isSubmitting = false;
  isLoading = true;

  dokumen: any = null;
  barang: any[] = [];

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.apiService
      .get('adjustment-case/' + this.data.id)
      .subscribe({
        next: (data: any) => {
          this.dokumen = {
            name: data.name,
            date: data.date,
            company: data.company == null ? null : data.company.name,
            hilang: data.company == null,
            isDelete: data.is_delete,
            isConfirm: data.is_confirm,
            createdBy: data.user_adjustment_case_code_created_byTouser.name,
            createdAt: data.created_at,
          };

          this.barang = (data.adjustment_case ?? []).map((x: any) => ({
            reference: x.product.reference,
            description: x.product.description,
            quantity: Number(x.quantity),
            unit: x.product_unit == null ? x.product.unit : x.product_unit.unit,
          }));
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

  get inisial(): string {
    return this.dokumen?.hilang ? '−' : '+';
  }

  get tipeKey(): string {
    return this.dokumen?.hilang
      ? 'adjustment-case__archive__view__type__lost'
      : 'adjustment-case__archive__view__type__found';
  }

  get statusKey(): string {
    if (this.dokumen?.isDelete) {
      return 'adjustment-case__archive__view__status__deleted';
    }
    return this.dokumen?.isConfirm
      ? 'adjustment-case__archive__view__status__confirmed'
      : 'adjustment-case__archive__view__status__pending';
  }

  get canDelete(): boolean {
    return (
      !this.isSubmitting &&
      this.isAdministrator &&
      this.dokumen?.isDelete === false &&
      this.dokumen?.isConfirm === true
    );
  }

  tutup(): void {
    this.dialogRef.close();
  }

  openDeleteConfirmation(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'adjustment-case__delete__confirmation',
          ),
        },
      })
      .afterClosed()
      .subscribe((jawaban) => {
        if (jawaban == true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`adjustment-case/${this.data.id}`)
            .subscribe({
              next: (hasil: any) => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'adjustment-case__delete__success',
                  ),
                );
                this.dialogRef.close(hasil);
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }
}
