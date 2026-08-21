import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { KOLOM_ISIAN } from 'src/app/utils/keycode.utils';
import { Subject, Subscription } from 'rxjs';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/components/product-selector/product-selector.component';
import { SalesInvoiceViewComponent } from 'src/app/components/document-view/sales-invoice-view/sales-invoice-view.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Buat retur penjualan — formulir satu halaman, kerangka form-buat 5a.
 *
 * STEPPER-NYA DIBUANG, tetapi urutan kerjanya tetap dipandu: barang dan
 * tanggal pembelian diisi dulu, baru tombol cari menawarkan faktur yang
 * memuat barang itu, lalu tiap barang dipetakan ke baris fakturnya —
 * harga retur SELALU harga faktur asal, bukan ketikan bebas.
 *
 * Mengubah jumlah, menambah/membuang barang, atau mengganti tanggal
 * pembelian MEMBATALKAN faktur yang sudah terpilih: kandidat dicari untuk
 * kombinasi persis itu, dan membiarkannya berarti mengirim retur atas
 * baris faktur yang belum tentu cocok lagi.
 *
 * Yang sengaja tidak diwarisi dari bentuk lamanya:
 * - Saringan ulang kandidat di sisi peramban. Pembandingnya ditulis `=`
 *   (penugasan) alih-alih `==`, sehingga sebenarnya meloloskan semuanya —
 *   dan server memang sudah menyaring dengan kriteria yang sama.
 * - Pesan galat "meta lu salah" / "kosong atuh bos". Checklist di kolom
 *   kanan menyatakan hal yang sama tanpa perlu kalimat itu sampai ke
 *   pengguna.
 * - payment_method null saat tak diisi. Skema server menuntut angka; TUNAI
 *   dikirim sebagai 0 dan server yang memetakannya ke null — bukan "tanpa
 *   metode", melainkan metode yang memang tidak bernama. Lihat
 *   pilihJenisMetode().
 */
@Component({
  selector: 'app-sales-return-create',
  templateUrl: './sales-return-create.component.html',
  styleUrls: ['./sales-return-create.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    ReactiveFormsModule,
    NgxMaskDirective,
    TranslatePipe,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatDatepickerInput,
  ],
  providers: [DatePipe],
})
export class SalesReturnCreateComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private dynamicComponentService: DynamicComponentService,
    private hotkeysService: HotkeysService,
    private dialog: MatDialog,
    private router: Router,
    private pageTitleService: PageTitleService,
  ) {
    this.hotkeysService.add([
      new Hotkey(
        'alt+a',
        (): boolean => {
          this.openItemSelector();
          return false;
        },
        KOLOM_ISIAN,
      ),
    ]);
  }

  productSelectorSubject: Subject<any> = new Subject();
  private langgananTanggal?: Subscription;

  isLoading = false;
  isSubmitting = false;
  /** Sudah pernah menekan cari — pembeda "belum dicari" dan "tidak ketemu". */
  sudahCari = false;
  billOptions: any[] = [];
  selectedBill: any = null;

  metaFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    bill_date: new FormControl('', Validators.required),
    payment_method_id: new FormControl(0),
  });

  productFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
  });

  ngOnInit(): void {
    /* Jalan pulang ke daftarnya ada di topbar, seperti penerimaan barang. */
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'sales-return__archive__title',
      kembaliJalur: '/Sales-return/Archive',
      tag: 'sales-return__new',
    });

    /*
      Satu langganan untuk satu kontrol, dipasang sekali. Bentuk lamanya
      memasang langganan baru pada SETIAP baris setiap kali barang berubah
      tanpa melepas yang lama, jadi satu ketikan bisa memicu belasan reset.
    */
    this.apiService
      .get('payment-method/all', { keyword: '', page: 1 })
      .subscribe({
        next: (data: any) => {
          this.metodeOpsi = data ?? [];
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });

    this.langgananTanggal = this.metaFormGroup.controls[
      'bill_date'
    ].valueChanges.subscribe(() => {
      this.resetPencarianFaktur();
    });
  }

  ngOnDestroy(): void {
    this.hotkeysService.reset();
    this.langgananTanggal?.unsubscribe();
  }

  get t(): FormArray {
    return this.productFormGroup.controls['items'] as FormArray;
  }

  getFormGroupAt(i: number): FormGroup {
    return this.t.controls[i] as FormGroup;
  }

  /* ---------------------------------------------------------------- */
  /* Metode pengembalian                                               */
  /* ---------------------------------------------------------------- */

  /**
   * Metode pengembalian — DAFTAR TETAP, semuanya terlihat tanpa mengetik.
   *
   * DI BASIS DATA, TUNAI ADALAH METODE YANG KOSONG. Server memetakan
   * payment_method_id 0 menjadi null, dan money-receipt mengumpulkan bucket
   * null itu ke baris bernama "Cash" — jadi retur yang metodenya tidak diisi
   * memang SUDAH terhitung sebagai pengembalian tunai selama ini.
   *
   * Bentuk sebelumnya memakai kotak cari: orang harus mengetik, hasilnya
   * dibatasi lima teratas, dan tunai tidak pernah muncul karena ia bukan baris
   * tabel. Akibatnya satu-satunya cara memilih tunai adalah TIDAK melakukan
   * apa pun — yang tidak pernah terbaca sebagai pilihan, dan membuat orang
   * ragu apakah returnya tersimpan benar.
   *
   * Daftarnya diambil dari /payment-method/all, yang MEMANG sudah menyisipkan
   * { id: null, name: "Cash" } di depan. Jadi tunai dan metode bernama datang
   * dari satu sumber, dan tidak ada pilihan yang dikarang di sisi peramban.
   */
  metodeOpsi: { id: number | null; name: string }[] = [];

  lacakMetode = (_: number, m: { id: number | null }): number => m.id ?? 0;

  /** Tunai memakai id null di server, tetapi 0 di formulir; skema menuntut angka. */
  metodeTerpilih(m: { id: number | null }): boolean {
    return (
      Number(this.metaFormGroup.value.payment_method_id ?? 0) === (m.id ?? 0)
    );
  }

  pilihMetodeTetap(m: { id: number | null }): void {
    this.metaFormGroup.patchValue({ payment_method_id: m.id ?? 0 });
  }

  /* ---------------------------------------------------------------- */
  /* Barang                                                            */
  /* ---------------------------------------------------------------- */

  openItemSelector(): void {
    this.productSelectorSubject =
      this.dynamicComponentService.createDynamicComponent(
        ProductSelectorComponent,
        {
          type: ProductSelectorType.sales,
        },
      );

    this.productSelectorSubject.subscribe((result: any) => {
      if (!result) {
        return;
      }

      const data = result.data;
      const sub = result.sub;

      if (this.adaBarangSama(data.id, sub == null ? null : sub.id)) {
        this.alertService.showSuccess(
          this.translateService.instant('general__item__exists'),
        );
        return;
      }

      this.t.push(
        this.formBuilder.group({
          product_id: [data.id, Validators.required],
          product_unit_id: [sub == null ? null : sub.id],
          reference: [data.reference],
          description: [data.description],
          quantity: ['', [Validators.required, Validators.min(0.01)]],
          unit: [sub == null ? data.unit : sub.unit],
          conversion: [sub == null ? 1 : sub.conversion],
          default_unit: [data.unit],
          /* Diisi setelah faktur terpilih — harga ikut faktur asal. */
          sales_invoice_id: [null],
          price: [0],
          discount: [0],
          priceOptions: [[]],
        }),
      );

      this.resetPencarianFaktur();
    });
  }

  private adaBarangSama(
    productID: number,
    productUnitID: number | null,
  ): boolean {
    return this.t.value.some(
      (x: any) =>
        x.product_id == productID && x.product_unit_id == productUnitID,
    );
  }

  deleteItem(i: number): void {
    this.t.removeAt(i);
    this.resetPencarianFaktur();
  }

  /** Terpasang pada (input) kolom jumlah — lihat catatan kelas. */
  jumlahBerubah(): void {
    this.resetPencarianFaktur();
  }

  satuanBaris(i: number): string {
    return this.getFormGroupAt(i).get('unit')?.value ?? '';
  }

  konversiBaris(i: number): string | null {
    const g = this.getFormGroupAt(i);
    const konversi = Number(g.get('conversion')?.value ?? 1);
    if (konversi <= 1) {
      return null;
    }

    return `1 ${g.get('unit')?.value} = ${konversi} ${
      g.get('default_unit')?.value
    }`;
  }

  /* ---------------------------------------------------------------- */
  /* Faktur asal                                                       */
  /* ---------------------------------------------------------------- */

  /** Barang dan tanggal pembelian siap — tombol cari boleh menyala. */
  get bisaCari(): boolean {
    return (
      !this.isLoading &&
      this.metaFormGroup.controls['bill_date'].valid &&
      this.t.length > 0 &&
      this.productFormGroup.valid
    );
  }

  cariFaktur(): void {
    if (!this.bisaCari) {
      return;
    }

    this.isLoading = true;
    this.apiService
      .post('sales-invoice/sales-return', {
        date: this.datePipe.transform(
          this.metaFormGroup.value.bill_date,
          'yyyy-MM-dd',
        ),
        sales_invoice: this.t.controls.map((x) => ({
          product_id: x.get('product_id')?.value,
          product_unit_id: x.get('product_unit_id')?.value,
          quantity: Number(x.get('quantity')?.value),
        })),
      })
      .subscribe({
        next: (data: any) => {
          /* Server sudah menyaring; hasilnya dipakai apa adanya. */
          this.billOptions = data;
          this.selectedBill = null;
          this.sudahCari = true;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  pilihFaktur(i: number): void {
    this.selectedBill = this.billOptions[i];

    this.t.controls.forEach((baris) => {
      const productID = baris.get('product_id')?.value;
      const productUnitID = baris.get('product_unit_id')?.value;
      const jumlah = Number(baris.get('quantity')?.value);

      const pilihan = (this.selectedBill.sales_invoice ?? [])
        .filter(
          (y: any) =>
            y.product_id == productID &&
            y.product_unit_id == productUnitID &&
            y.quantity >= jumlah,
        )
        .map((y: any) => ({
          sales_invoice_id: y.id,
          price: y.price,
          discount: y.discount,
        }));

      baris.patchValue({ priceOptions: pilihan });

      /*
        Satu-satunya baris yang cocok langsung dipetakan. Bentuk lamanya
        tetap menyuruh memilih walau pilihannya cuma satu.
      */
      if (pilihan.length === 1) {
        baris.patchValue({
          sales_invoice_id: pilihan[0].sales_invoice_id,
          price: pilihan[0].price,
          discount: pilihan[0].discount,
        });
      } else {
        baris.patchValue({ sales_invoice_id: null, price: 0, discount: 0 });
      }
    });
  }

  lihatFaktur(i: number): void {
    this.dialog.open(SalesInvoiceViewComponent, {
      data: {
        id: this.billOptions[i].id,
        noAction: true,
      },
    });
  }

  pilihBarisFaktur(event: any, index: number): void {
    const nilai = event.value;
    this.getFormGroupAt(index).patchValue({
      sales_invoice_id: nilai.sales_invoice_id,
      price: nilai.price,
      discount: nilai.discount,
    });
  }

  private resetPencarianFaktur(): void {
    this.billOptions = [];
    this.selectedBill = null;
    this.sudahCari = false;

    this.t.controls.forEach((baris) => {
      baris.patchValue({
        sales_invoice_id: null,
        price: 0,
        discount: 0,
        priceOptions: [],
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Ringkasan dan kirim                                               */
  /* ---------------------------------------------------------------- */

  get semuaTerpetakan(): boolean {
    return (
      this.t.length > 0 &&
      this.t.controls.every((x) => x.get('sales_invoice_id')?.value != null)
    );
  }

  get totalRetur(): number {
    return this.t.controls.reduce((total, x) => {
      if (x.get('sales_invoice_id')?.value == null) {
        return total;
      }

      return (
        total +
        (Number(x.get('price')?.value) - Number(x.get('discount')?.value)) *
          Number(x.get('quantity')?.value)
      );
    }, 0);
  }

  totalBaris(i: number): number {
    const g = this.getFormGroupAt(i);
    if (g.get('sales_invoice_id')?.value == null) {
      return 0;
    }

    return (
      (Number(g.get('price')?.value) - Number(g.get('discount')?.value)) *
      Number(g.get('quantity')?.value)
    );
  }

  get bisaSimpan(): boolean {
    return (
      !this.isSubmitting &&
      !this.isLoading &&
      this.metaFormGroup.valid &&
      this.productFormGroup.valid &&
      this.selectedBill != null &&
      this.semuaTerpetakan
    );
  }

  batal(): void {
    this.router.navigate(['/Sales-return/Archive']);
  }

  submit(): void {
    if (!this.bisaSimpan) {
      return;
    }

    this.isSubmitting = true;
    this.apiService
      .post('sales-return', {
        sales_invoice_code_id: this.selectedBill.id,
        date: this.datePipe.transform(
          this.metaFormGroup.value.date,
          'yyyy-MM-dd',
        ),
        /*
          Skema server menuntut angka — 0 berarti tanpa metode pengembalian
          dan server yang memetakannya ke null. Mengirim null ditolak.
        */
        payment_method_id: Number(
          this.metaFormGroup.value.payment_method_id ?? 0,
        ),
        sales_return: this.t.controls.map((x) => ({
          sales_invoice_id: x.get('sales_invoice_id')?.value,
          quantity: Number(x.get('quantity')?.value),
        })),
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('sales-return__create__success'),
          );

          this.t.clear();
          this.metaFormGroup.reset({
            date: new Date(),
            bill_date: '',
            payment_method_id: 0,
          });
          this.resetPencarianFaktur();
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
