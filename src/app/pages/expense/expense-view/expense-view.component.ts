import { DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Tampilan BACA satu pengeluaran — dibuka klik baris daftar mutasi
 * oleh peran mana pun. Tombol ubah hanya tampil untuk administrator
 * (server juga menolaknya untuk peran lain); menutup dengan 'edit'
 * meminta pemanggil membuka dialog ubahnya.
 */
@Component({
  selector: 'app-expense-view',
  templateUrl: './expense-view.component.html',
  styleUrls: ['./expense-view.component.scss'],
  imports: [NgIf, DecimalPipe, DatePipe, TranslatePipe],
})
export class ExpenseViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<ExpenseViewComponent>,
  ) {}

  isLoading = true;
  isAdministrator = false;
  pengeluaran: any = null;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.apiService
      .get(`expense/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.pengeluaran = data;
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

  ubah(): void {
    this.dialogRef.close('edit');
  }

  tutup(): void {
    this.dialogRef.close();
  }
}
