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
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';

import { AutocompleteSearchComponent } from 'src/app/components/autocomplete-search/autocomplete-search.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { availableBankSearch, IBank } from 'src/app/utils/bank';
import { CustomerCreateComponent } from 'src/app/pages/customer/customer-create/customer-create.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

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
  selector: 'app-overpayment-create',
  templateUrl: './overpayment-create.component.html',
  styleUrl: './overpayment-create.component.scss',
  imports: [
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
  ) {}

  banks: IBank[] = availableBankSearch.search('').splice(0, 8);
  isSubmitting: boolean = false;

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
    this.returnFormGroup.controls['return_payment_bank'].valueChanges.subscribe(
      (data) => {
        this.banks = availableBankSearch.search(data ?? '').splice(0, 8);
      },
    );
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

  batal() {
    this.router.navigate(['/Overpayment/Archive']);
  }

  submitForm() {
    if (!this.bolehSimpan) {
      return;
    }

    this.isSubmitting = true;
    const customerID = this.metaFormGroup.get('customer_id')?.value;
    const paymentMethodID = this.metaFormGroup.get('payment_method_id')?.value;
    const transfer = this.metode === 'Bank transfer';

    this.apiService
      .post('overpayment', {
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
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('overpayment__create__success'),
          );
          this.metaFormGroup.reset();
          this.returnFormGroup.reset();
          this.metode = '';
          this.router.navigate(['/Overpayment/Archive']);
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
