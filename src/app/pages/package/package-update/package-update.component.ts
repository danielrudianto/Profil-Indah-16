import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Ubah paket — nama, deskripsi, dan harga paketnya saja.
 *
 * ISI PAKET SENGAJA BACA-SAJA: server memang hanya menyimpan meta pada
 * jalur ubah, dan faktur lama menghitung porsi proporsionalnya dari
 * komposisi ini. Halaman lamanya menampilkan isi sebagai kolom isian yang
 * bisa diketik lalu DIBUANG diam-diam saat disimpan — pengguna mengira
 * komposisinya berubah padahal tidak. Bila isinya harus berubah, buat
 * paket baru dan hapus yang ini.
 */
@Component({
  selector: 'app-package-update',
  templateUrl: './package-update.component.html',
  styleUrls: ['./package-update.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    DecimalPipe,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    NgxMaskDirective,
    TranslatePipe,
  ],
})
export class PackageUpdateComponent implements OnInit {
  constructor(
    private alertService: AlertService,
    private apiService: ApiService,
    private authService: AuthService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  isAdministrator = false;
  isLoading = true;
  isSubmitting = false;
  isi: any[] = [];

  metaFormGroup: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`product-package/${this.activatedRoute.snapshot.params['id']}`)
      .subscribe({
        next: (data: any) => {
          this.metaFormGroup.patchValue({
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
          });

          this.isi = (data.package_content as any[]).map((x) => ({
            reference: x.product.reference,
            description: x.product.description,
            quantity: Number(x.quantity),
            unit: x.product_unit == null ? x.product.unit : x.product_unit.unit,
            price: Number(x.price),
          }));
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Package']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  /** Nilai seluruh isi pada harga acuannya — pembanding harga paket. */
  get nilaiIsi(): number {
    return this.isi.reduce((total, x) => total + x.quantity * x.price, 0);
  }

  get hargaPaket(): number {
    return Number(this.metaFormGroup.get('price')?.value) || 0;
  }

  get hemat(): number {
    return this.nilaiIsi - this.hargaPaket;
  }

  batal(): void {
    this.router.navigate(['/Package']);
  }

  delete(): void {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('package__delete__confirmation'),
          document: this.metaFormGroup.get('name')?.value,
        },
      })
      .afterClosed()
      .subscribe((hasil) => {
        /*
          Konfirmasi menutup dengan `true` HANYA lewat tombol hapus; menekan
          batal (atau backdrop) mengirim undefined.
        */
        if (hasil !== true) {
          this.isSubmitting = false;
          return;
        }

        this.apiService
          .delete(`product-package/${this.metaFormGroup.get('id')?.value}`)
          .subscribe({
            next: () => {
              this.alertService.showSuccess(
                this.translateService.instant('package__delete__success'),
              );
              this.router.navigate(['/Package']);
            },
            error: (error) => {
              this.alertService.showError(error);
              this.isSubmitting = false;
            },
          });
      });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('product-package', {
        id: Number(this.metaFormGroup.get('id')?.value),
        name: this.metaFormGroup.get('name')?.value,
        description: this.metaFormGroup.get('description')?.value,
        price: Number(this.metaFormGroup.get('price')?.value),
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('package__update__success'),
          );
          this.router.navigate(['/Package']);
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
