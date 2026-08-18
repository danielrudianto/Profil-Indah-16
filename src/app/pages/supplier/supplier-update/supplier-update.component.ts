import { Component, Inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

@Component({
    selector: 'app-supplier-update',
    templateUrl: './supplier-update.component.html',
    imports: [
    DialogShellComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective,
    TranslatePipe,
  ]
})
export class SupplierUpdateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<SupplierUpdateComponent>,
    private translateService: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  supplierFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
    can_delete: new FormControl(false),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isAdministrator = this.authService.isAdministrator();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`supplier/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.supplierFormGroup.patchValue(data);
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

  closeDialog() {
    this.dialogRef.close();
  }

  delete() {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('supplier__delete__message'),
        },
      })
      .afterClosed()
      .subscribe((hasil) => {
        /*
          Konfirmasi menutup dengan `true` HANYA lewat tombol hapus; menekan
          batal (atau backdrop) mengirim undefined. Tanpa pemeriksaan ini,
          membatalkan konfirmasi tetap menghapus datanya.
        */
        if (hasil !== true) {
          this.isSubmitting = false;
          return;
        }

        this.apiService.delete(`supplier/${this.data.id}`).subscribe({
          next: (_) => {
            this.alertService.showSuccess(
              this.translateService.instant('supplier__delete__success')
            );

            this.dialogRef.close('deleted');
          },
          error: (error) => {
            this.alertService.showError(error);
            this.isSubmitting = false;
          },
        });
      });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('supplier', this.supplierFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('supplier__update__success')
          .subscribe((message: string) => {
            this.dialogRef.close(data);
            this.alertService.showSuccess(`${data.name} ${message}`);
          });
      },
      error: (error) => {
        this.alertService.showError(error);
        this.isSubmitting = false;
      },
    });
  }
}
