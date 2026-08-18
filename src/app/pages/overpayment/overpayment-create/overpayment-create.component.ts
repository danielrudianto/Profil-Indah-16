import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';

import { AutocompleteSearchComponent } from 'src/app/components/autocomplete-search/autocomplete-search.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { availableBankSearch, IBank } from 'src/app/utils/bank';
import { CustomerCreateComponent } from 'src/app/pages/customer/customer-create/customer-create.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

/**
 * Catat kelebihan bayar — bagian `16a`/`16b` berkas desain.
 *
 * METODE PENGEMBALIAN ADALAH SATU NILAI, DIBACA DARI SATU TEMPAT. Versi
 * sebelumnya menyimpannya di kontrol formulir sekaligus memeriksanya di dua
 * tempat dengan ejaan berbeda: daftar pilihannya mengirim 'Bank transfer',
 * sementara bankValidator memeriksa 'transfer'. Validator itu karena itu tidak
 * pernah menyala sekali pun — dan pesan galatnya dibaca dari metaFormGroup
 * padahal validatornya dipasang pada returnFormGroup, jadi seandainya menyala
 * pun pesannya tidak akan muncul.
 *
 * Sekarang metodenya dipegang satu ruas, dan kolom mana yang wajib diisi
 * ditentukan sekali ketika metodenya berubah.
 */
@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-overpayment-create',
  templateUrl: './overpayment-create.component.html',
  styleUrl: './overpayment-create.component.scss',
  imports: [
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteSearchComponent,
    NgxMaskDirective,
    NgFor,
    NgIf,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class OverpaymentCreateComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
  ) {}

  banks: IBank[] = availableBankSearch.search('').splice(0, 8);
  isSubmitting: boolean = false;

  /**
   * Terisi ketika halaman dibuka dari menu "Update" daftar 16c —
   * formulir yang sama dipakai untuk mencatat dan mengubah, hanya
   * alamat kirimnya yang berbeda.
   */
  editId: number | null = null;

  /* Teks yang tampil di kedua kolom autocomplete saat mode ubah. */
  namaPelangganAwal = 'Retail';
  namaMetodeAwal?: string;

  metaFormGroup: FormGroup = new FormGroup({
    customer_id: new FormControl(0, Validators.required),
    date: new FormControl('', Validators.required),
    payment_method_id: new FormControl('', Validators.required),
    value: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  returnFormGroup: FormGroup = new FormGroup({
    return_payment_date: new FormControl('', Validators.required),
    return_payment_name: new FormControl('', Validators.required),
    return_payment_bank: new FormControl(''),
    return_payment_number: new FormControl(''),
  });

  /**
   * Metode pengembalian: '' (belum dipilih), 'Cash', atau 'Bank transfer'.
   *
   * Ejaannya sama persis dengan yang dikirim ke server dan yang tersimpan di
   * kolom return_payment_method, jadi tidak ada penerjemahan di tengah jalan
   * yang bisa meleset.
   */
  metode: string = '';

  ngOnInit(): void {
    const idUbah = Number(this.route.snapshot.queryParams['id']);
    if (Number.isInteger(idUbah) && idUbah > 0) {
      this.editId = idUbah;
    }

    /* Jalan pulang ke daftarnya ada di topbar, seperti penerimaan barang. */
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'overpayment__title',
      kembaliJalur: '/Overpayment',
      tag: this.editId
        ? 'overpayment__update__title'
        : 'overpayment__create__title',
    });

    this.returnFormGroup.controls['return_payment_bank'].valueChanges.subscribe(
      (data) => {
        this.banks = availableBankSearch.search(data ?? '').splice(0, 8);
      },
    );

    if (this.editId) {
      this.muatUntukUbah(this.editId);
    }
  }

  /**
   * Mengisi formulir dari catatan yang ada. Catatan yang sudah
   * dikembalikan tidak bisa diubah — server menolaknya dengan 409, jadi
   * halamannya jujur sejak awal dan memulangkan penggunanya.
   */
  private muatUntukUbah(id: number): void {
    this.apiService.get(`overpayment/${id}`).subscribe({
      next: (data: any) => {
        if (data.is_resolved) {
          this.alertService.showError(
            this.translateService.instant('overpayment__update__resolved'),
          );
          this.router.navigate(['/Overpayment']);
          return;
        }

        this.metaFormGroup.patchValue({
          customer_id: data.customer_id ?? 0,
          date: data.date,
          payment_method_id: data.payment_method_id ?? -1,
          value: Number(data.value),
        });
        this.returnFormGroup.patchValue({
          return_payment_date: data.return_payment_date,
          return_payment_name: data.return_payment_name,
          return_payment_bank: data.return_payment_bank ?? '',
          return_payment_number: data.return_payment_number ?? '',
        });
        this.pilihMetode(data.return_payment_method);

        this.namaPelangganAwal = data.customer?.name ?? 'Retail';
        this.namaMetodeAwal = data.payment_method?.name ?? undefined;
      },
      error: (error) => {
        this.alertService.showError(error);
        this.router.navigate(['/Overpayment']);
      },
    });
  }

  /**
   * Memilih metode pengembalian, sekaligus menentukan kolom mana yang wajib.
   *
   * Kolom bank dan nomor akun DIKOSONGKAN ketika berpindah ke cash. Kalau
   * dibiarkan, isian yang sudah terlanjur diketik ikut terkirim pada catatan
   * yang metodenya cash — dan yang membacanya nanti melihat nomor rekening
   * pada pengembalian yang diambil tunai.
   */
  pilihMetode(pilihan: string) {
    this.metode = pilihan;

    const bank = this.returnFormGroup.controls['return_payment_bank'];
    const nomor = this.returnFormGroup.controls['return_payment_number'];

    if (pilihan === 'Bank transfer') {
      bank.setValidators(Validators.required);
      nomor.setValidators(Validators.required);
    } else {
      bank.clearValidators();
      nomor.clearValidators();
      bank.setValue('');
      nomor.setValue('');
    }

    bank.updateValueAndValidity();
    nomor.updateValueAndValidity();
  }

  onSelectCustomer(data: any) {
    this.metaFormGroup.patchValue({ customer_id: data.id });
  }

  onUnselectCustomer() {
    this.metaFormGroup.patchValue({ customer_id: null });
  }

  onSelectPaymentMethod(data: any) {
    this.metaFormGroup.patchValue({ payment_method_id: data.id });
  }

  onUnselectPaymentMethod() {
    this.metaFormGroup.patchValue({ payment_method_id: null });
  }

  tambahPelanggan() {
    this.dialog.open(CustomerCreateComponent, {
      panelClass: 'nocturne-dialog',
      backdropClass: 'nocturne-dialog-backdrop',
    });
  }

  /* ---------------------------------------------------------------- */
  /* Ringkasan                                                         */
  /* ---------------------------------------------------------------- */

  get nominal(): number {
    return Number(this.metaFormGroup.controls['value'].value) || 0;
  }

  get namaPenerima(): string {
    return this.returnFormGroup.controls['return_payment_name'].value ?? '';
  }

  /** "22/08/2026 · Transfer", atau tanggalnya saja bila belum diisi. */
  get ringkasPengembalian(): string {
    const tanggal = this.returnFormGroup.controls['return_payment_date'].value;
    const label =
      this.metode === 'Cash'
        ? this.translateService.instant('overpayment__create__method-cash')
        : this.translateService.instant('overpayment__create__method-transfer');

    if (!tanggal) {
      return label;
    }

    return `${moment(new Date(tanggal)).format('DD/MM/YYYY')} · ${label}`;
  }

  /** "BCA · Sinar Abadi PT", kosong bila banknya belum dipilih. */
  get tujuanTransfer(): string {
    const bank = this.returnFormGroup.controls['return_payment_bank'].value;
    if (!bank) {
      return '';
    }

    const nama = this.namaPenerima;
    return nama ? `${bank} · ${nama}` : bank;
  }

  get bolehSimpan(): boolean {
    return (
      this.metaFormGroup.valid &&
      this.returnFormGroup.valid &&
      this.metode !== '' &&
      !this.isSubmitting
    );
  }

  /**
   * Daftar periksa "sebelum simpan" — pola yang sama dengan formulir buat
   * lainnya. Dihitung dari keadaan form saat digambar, bukan disimpan.
   */
  get checklist(): { kunci: string; selesai: boolean }[] {
    const meta = this.metaFormGroup;
    const kembali = this.returnFormGroup;
    return [
      {
        kunci: 'overpayment__create__check-receipt',
        selesai:
          !!meta.value.date &&
          meta.controls['payment_method_id'].valid &&
          Number(meta.value.value) > 0,
      },
      {
        kunci: 'overpayment__create__check-plan',
        selesai: !!kembali.value.return_payment_date,
      },
      {
        kunci: 'overpayment__create__check-method',
        selesai: this.metode !== '' && kembali.valid,
      },
    ];
  }

  batal() {
    this.router.navigate(['/Overpayment']);
  }

  submitForm() {
    if (!this.bolehSimpan) {
      return;
    }

    this.isSubmitting = true;
    const customerID = this.metaFormGroup.get('customer_id')?.value;
    const paymentMethodID = this.metaFormGroup.get('payment_method_id')?.value;
    const transfer = this.metode === 'Bank transfer';

    const isian = {
      customer_id: customerID == 0 ? null : customerID,
      payment_method_id: paymentMethodID == -1 ? null : paymentMethodID,
      date: moment(new Date(this.metaFormGroup.get('date')?.value)).format(
        'YYYY-MM-DD',
      ),
      return_payment_date: moment(
        new Date(this.returnFormGroup.get('return_payment_date')?.value),
      ).format('YYYY-MM-DD'),
      return_payment_method: this.metode,
      return_payment_name: this.namaPenerima,
      /* Cash tidak punya bank maupun nomor akun; dikirim null, bukan ''. */
      return_payment_bank: transfer
        ? this.returnFormGroup.get('return_payment_bank')?.value
        : null,
      return_payment_number: transfer
        ? this.returnFormGroup.get('return_payment_number')?.value
        : null,
      value: this.nominal,
      sales_deposit_code_id: null,
    };

    /* Formulir yang sama, dua alamat: PUT saat mengubah, POST saat mencatat. */
    const kirim = this.editId
      ? this.apiService.put(`overpayment/${this.editId}`, isian)
      : this.apiService.post('overpayment', isian);

    kirim
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant(
              this.editId
                ? 'overpayment__update__success'
                : 'overpayment__create__success',
            ),
          );
          this.metaFormGroup.reset();
          this.returnFormGroup.reset();
          this.metode = '';
          this.router.navigate(['/Overpayment']);
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
