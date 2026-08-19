import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

/**
 * Dialog tambah tipe barang — sistem desain Nocturne.
 *
 * Masih dibuka lewat DynamicComponentService, bukan MatDialog seperti
 * kembarannya di merek barang. Perbedaan itu diwarisi apa adanya:
 * menyeragamkan kedua mekanisme mengubah cara dialog dibuka di banyak halaman
 * lain sekaligus, dan itu pekerjaan tersendiri. app-dialog-shell memang
 * dirancang agar tidak peduli siapa yang membukanya.
 *
 * Cacat yang sama dengan dialog merek ikut diperbaiki: isSubmitting yang tidak
 * pernah kembali ke false saat gagal, dan pesan berhasil yang ditulis langsung
 * dalam bahasa Inggris.
 *
 * CATATAN: kolom "Deskripsi" pada berkas desain tidak dipasang — tabel
 * product_type tidak memilikinya, jadi isiannya akan hilang tanpa jejak.
 */
@Component({
  selector: 'app-product-type-create',
  templateUrl: './product-type-create.component.html',
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    TranslatePipe,
    DynamicDialogComponent,
    DialogShellComponent,
  ],
})
export class ProductTypeCreateComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  isOpened = true;
  isSubmitting = false;

  /*
    Hasil cek nama kembar — tipe bernama sama pernah lahir dua kali
    (LIGHTING) karena tidak ada yang memberi tahu si pengetik. Dicek
    sambil mengetik; backend tetap menolak sebagai penjaga terakhir.
  */
  namaKembar = false;
  private langgananNama?: Subscription;

  typeFormGroup: FormGroup = new FormGroup({
    /* 45 huruf mengikuti lebar kolom name di tabel product_type. */
    name: new FormControl('', [Validators.required, Validators.maxLength(45)]),
  });

  ngOnInit(): void {
    this.langgananNama = this.typeFormGroup
      .get('name')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((nilai: string) =>
          this.apiService.get('product-type/autocomplete', {
            keyword: (nilai ?? '').trim(),
          }),
        ),
      )
      .subscribe({
        next: (data: any) => {
          const nama = (this.typeFormGroup.value.name ?? '')
            .trim()
            .toLowerCase();
          this.namaKembar =
            nama !== '' &&
            (data as any[]).some((x) => x.name.trim().toLowerCase() === nama);
        },
      });
  }

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.langgananNama?.unsubscribe();
  }

  submitForm(): void {
    if (this.isSubmitting || !this.typeFormGroup.valid || this.namaKembar) {
      return;
    }

    this.isSubmitting = true;

    this.apiService
      .post('product-type', this.typeFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant(
              'general__created-successfully',
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

  closeDialog(hasil?: any): void {
    this.isOpened = false;
    /* Menunggu peralihan menutupnya selesai sebelum komponennya dicabut. */
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(hasil);
    }, 300);
  }
}
