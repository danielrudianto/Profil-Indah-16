import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from 'src/app/components/dynamic-dialog/dynamic-dialog.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ubah tipe barang — sistem desain Nocturne.
 *
 * Masih dibuka lewat DynamicComponentService, sama seperti dialog tambahnya;
 * app-dialog-shell memang dirancang agar tidak peduli siapa yang membukanya.
 *
 * Dua cacat yang ikut diperbaiki:
 *
 * - isSubmitting tidak pernah kembali ke false ketika kirimannya gagal,
 *   sehingga satu kegagalan mematikan tombol simpannya selamanya.
 * - Pesan berhasilnya berbunyi "created successfully" — ditulis langsung dalam
 *   bahasa Inggris, DAN menyebut "dibuat" pada dialog yang justru mengubah.
 */
@Component({
  selector: 'app-product-type-update',
  templateUrl: './product-type-update.component.html',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    DynamicDialogComponent,
    DialogShellComponent,
  ],
})
export class ProductTypeUpdateComponent implements OnInit, AfterViewInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  @Input('data') data: any;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  isOpened = true;
  isLoading = true;
  isSubmitting = false;

  typeFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    /* 45 huruf mengikuti lebar kolom name di tabel product_type. */
    name: new FormControl('', [Validators.required, Validators.maxLength(45)]),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
  }

  fetchByID(): void {
    this.apiService
      .get(`product-type/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.typeFormGroup.patchValue(data);
        },
        error: (error: any) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  submitForm(): void {
    if (this.isSubmitting || this.isLoading || !this.typeFormGroup.valid) {
      return;
    }

    this.isSubmitting = true;

    this.apiService
      .put('product-type', this.typeFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant(
              'general__updated-successfully',
            )}`,
          );
          this.closeDialog(data);
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  closeDialog(data: any = undefined): void {
    this.isOpened = false;
    /* Menunggu peralihan menutupnya selesai sebelum komponennya dicabut. */
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }
}
