import { DatePipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/components/product-selector/product-selector.component';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';
import { DeleteConfirmationComponent } from '../../../components/delete-confirmation/delete-confirmation.component';
import { SubmitConfirmationComponent } from '../../../components/submit-confirmation/submit-confirmation.component';
import { NgxMaskDirective } from 'ngx-mask';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-good-receipt-create',
    templateUrl: './good-receipt-create.component.html',
    styleUrls: ['./good-receipt-create.component.scss'],
    imports: [
    MatFormField,
    MatLabel,
    MatInput,
      ReactiveFormsModule,
      NgIf,
      NgFor,
      DecimalPipe,
      NgxMaskDirective,
      TranslatePipe,
      ComboSearchComponent,
    ]
})
export class GoodReceiptCreateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private _hotKeysService: HotkeysService,
    private dialog: MatDialog
  ) {
    this._hotKeysService.add([
      new Hotkey('alt + a', (): boolean => {
        this.openItemSelector();
        return false;
      }),
    ]);
  }

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4(), Validators.required),
    supplier_id: new FormControl('', Validators.required),
    company_id: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    delivery_order: new FormControl('', Validators.required),
    /*
      Kolom faktur. Ketiganya SUDAH ADA di tabel good_receipt_code sejak awal —
      invoice_name, faktur, discount — dan selama ini dikirim kosong oleh form
      ini lalu diisi belakangan lewat halaman Faktur Pembelian yang terpisah.
      Faktur Pembelian memang bukan dokumen tersendiri: tidak ada tabelnya,
      tidak ada controllernya, tidak ada rutenya di server.
    */
    invoice_name: new FormControl(''),
    faktur: new FormControl(''),
    document_discount: new FormControl(0),
    items: new FormArray([]),
  });

  itemFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  isSubmitting: boolean = false;

  /**
   * Peran 5 dan 7 boleh melihat DAN mengubah harga beli di sini; peran
   * pembelian hanya mencatat jumlah barang masuk.
   *
   * Dibaca dari peran penggunanya, bukan dari potongan alamat — sejak keempat
   * subpohon peran digabung, awalan /Administrator sudah tidak ada.
   *
   * Batas yang sama dijaga administratorMiddleware pada PUT
   * /product/price-purchase di server; yang di sini hanya supaya kolom yang
   * pasti ditolak tidak ditawarkan lebih dulu.
   */
  bolehUbahHarga = inject(AuthService).isAdministrator();

  /**
   * Keadaan dokumen yang sedang dibuat.
   *
   * "surat-jalan" — barangnya datang, fakturnya belum. Catatannya tersimpan
   * sebagai MENUNGGU FAKTUR dan harus dilengkapi belakangan.
   * "lengkap" — faktur supplier sudah di tangan; dokumennya final.
   *
   * Hanya peran 5 dan 7 yang melihat pilihan ini. Peran pembelian selalu
   * mencatat surat jalan saja, dan bahkan tidak melihat harganya.
   */
  keadaan: 'surat-jalan' | 'lengkap' = 'surat-jalan';

  pilihKeadaan(nilai: 'surat-jalan' | 'lengkap'): void {
    this.keadaan = nilai;

    /*
      Kolom faktur dikosongkan ketika kembali ke surat jalan. Membiarkannya
      terisi berarti angka yang tidak terlihat lagi tetap ikut terkirim.
    */
    if (nilai === 'surat-jalan') {
      this.metaFormGroup.patchValue({
        invoice_name: '',
        faktur: '',
        document_discount: 0,
      });
    }
  }

  get dokumenLengkap(): boolean {
    return this.bolehUbahHarga && this.keadaan === 'lengkap';
  }

  private pageTitleService = inject(PageTitleService);

  ngOnInit(): void {
    /*
      Tag topbar untuk halaman ini "Penerimaan baru", bukan nama menunya —
      yang dilihat pengguna dokumen yang sedang dibuat, bukan daftar asalnya.
    */
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'good-receipt__title',
      kembaliJalur: '/Good-receipt/Archive',
      tag: 'good-receipt__new',
      mode: this.bolehUbahHarga ? 'good-receipt__admin-mode' : undefined,
    });

    this.itemFormGroup.valueChanges.subscribe(() => {
      console.log(this.itemFormGroup.controls);
    });
  }

  get f() {
    return this.itemFormGroup.controls;
  }

  get t() {
    return this.f['items'] as FormArray;
  }

  onSelectSupplier(event: any) {
    this.metaFormGroup.patchValue({
      supplier_id: event.id,
    });
  }

  onUnselectSupplier() {
    this.metaFormGroup.patchValue({
      supplier_id: null,
    });
  }

  onSelectCompany(event: any) {
    this.metaFormGroup.patchValue({
      company_id: event.id,
    });
  }

  onUnselectCompany() {
    this.metaFormGroup.patchValue({
      company_id: null,
    });
  }

  openItemSelector() {
    /*
      Dialognya TETAP TERBUKA. Tiap penekanan barang menambah satu baris lewat
      onTambah, dan barisSaatIni dibaca dialog untuk menggambar lencana
      "N baris" beserta rinciannya.
    */
    this.dynamicComponentService.createDynamicComponent(
      ProductSelectorComponent,
      {
        type: ProductSelectorType.purchase,
        onTambah: (hasil: any) => this.tambahBaris(hasil),
        barisSaatIni: () => this.t.value,
      },
    );
  }

  /**
   * Menambah satu baris barang.
   *
   * BARANG YANG SAMA BOLEH BERULANG, satuan apa pun. Bonus dari supplier
   * dicatat sebagai baris terpisah dengan harga sendiri — 10 box @150.000 dan
   * 1 box @0 adalah dua baris dengan barang DAN satuan yang sama.
   *
   * Bentuk sebelumnya menolaknya lewat checkExisting, dan penolakannya bahkan
   * bergantung urutan mengetik: satuan dasar ditolak bila barangnya sudah ada
   * dalam satuan apa pun, sementara urutan sebaliknya lolos. Memisahkan
   * barisnya juga lebih jujur bagi HPP — rata-rata tertimbang dari dua harga
   * yang sebenarnya, bukan satu harga karangan.
   */
  private tambahBaris(hasil: any): void {
    const data = hasil.data;
    const sub = hasil.sub;

    this.t.push(
      this.formBuilder.group({
        product_id: [data.id, Validators.required],
        product_unit_id: [sub == null ? null : sub.id],
        reference: [data.reference],
        description: [data.description],
        quantity: ['', [Validators.required, Validators.min(0.01)]],
        unit: [sub == null ? data.unit : sub.unit],
        conversion: [sub == null ? 1 : sub.conversion],
        /* Harga beli, bukan harga jual — dari satuannya bila satuan dipilih. */
        price: [sub == null ? data.purchase_price : sub.purchase_price],
        discount: [
          sub == null ? data.purchase_discount : sub.purchase_discount,
        ],
        default_unit: [data.unit],
        stock: [data.stock ?? null],
        save_price: [false],
      }),
    );

    this.itemFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }


  /**
   * Menimpa harga beli di master untuk baris yang dicentang.
   *
   * Dijalankan SETELAH penerimaannya tersimpan, bukan saat kolomnya diketik:
   * penerimaan yang akhirnya dibatalkan tidak boleh meninggalkan harga master
   * yang terlanjur berubah.
   *
   * Nilainya masuk ke purchase_price dan purchase_discount — endpoint ini yang
   * mengurusnya, termasuk memilih product_unit bila satuannya dipilih.
   * Meilisearch ikut diperbarui sendiri lewat antrean "product-updated".
   */
  private simpanHargaMaster(): void {
    if (!this.bolehUbahHarga) {
      return;
    }

    const items = this.t.controls
      .filter((x) => x.get('save_price')?.value)
      .map((x) => ({
        product_id: x.get('product_id')?.value,
        product_unit_id: x.get('product_unit_id')?.value,
        price: Number(x.get('price')?.value ?? 0),
        discount: Number(x.get('discount')?.value ?? 0),
      }));

    if (items.length === 0) {
      return;
    }

    this.apiService.put('product/price-purchase', { items }).subscribe({
      next: () => {
        this.alertService.showSuccess(
          this.translateService.instant('good-receipt__create__price-saved'),
        );
      },
      error: (error: any) => {
        /*
          Penerimaannya sendiri sudah tersimpan. Kegagalan di sini hanya berarti
          harga master tidak ikut berubah, jadi yang dilaporkan itu — bukan
          kegagalan penyimpanan penerimaannya.
        */
        this.alertService.showError(error);
      },
    });
  }

  /**
   * Berapa baris yang memakai barang yang sama.
   *
   * Dipakai menandai baris berulang dengan pill "×N". MENANDAI, BUKAN
   * MENGHALANGI: barang yang sama memang boleh berkali-kali — bonus supplier
   * dicatat begitu — tetapi yang tidak sengaja menambahkannya dua kali harus
   * bisa melihatnya tanpa menghitung sendiri.
   */
  /* ---------------------------------------------------------------- */
  /* Ringkasan uang                                                    */
  /*                                                                   */
  /* Angka pada berkas desain TIDAK berjumlah dengan sendirinya:        */
  /* Subtotal 199.128.800 dan Diskon item 214.600 di sana menjumlahkan  */
  /* diskon PER SATUAN, bukan dikalikan jumlahnya. Yang dipakai di sini */
  /* bentuk yang konsisten — semuanya dikali jumlah — dan hasilnya      */
  /* justru mengeluarkan Total yang sama persis dengan desainnya,       */
  /* 198.664.200. Jadi yang meleset di sana dua baris atasnya, bukan    */
  /* totalnya.                                                          */
  /* ---------------------------------------------------------------- */

  private angka(x: any, kunci: string): number {
    return Number(x.get(kunci)?.value ?? 0) || 0;
  }

  /** Harga sebelum diskon apa pun. */
  get subtotal(): number {
    return this.t.controls.reduce(
      (jml, x) => jml + this.angka(x, 'price') * this.angka(x, 'quantity'),
      0,
    );
  }

  /** Jumlah diskon tiap baris, dikali jumlah barangnya. */
  get diskonItem(): number {
    return this.t.controls.reduce(
      (jml, x) => jml + this.angka(x, 'discount') * this.angka(x, 'quantity'),
      0,
    );
  }

  get diskonDokumen(): number {
    return Number(this.metaFormGroup.get('document_discount')?.value ?? 0) || 0;
  }

  get total(): number {
    return this.subtotal - this.diskonItem - this.diskonDokumen;
  }

  /** Total satu baris, sesudah diskonnya sendiri. */
  totalBaris(i: number): number {
    const x = this.getFormGroupAt(i);
    return (this.angka(x, 'price') - this.angka(x, 'discount')) *
      this.angka(x, 'quantity');
  }

  jumlahBaris(productId: number): number {
    return this.t.controls.filter(
      (x) => x.get('product_id')?.value === productId,
    ).length;
  }

  deleteItem(i: number) {
    this.t.removeAt(i);

    this.itemFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post(`good-receipt/check`, {
        name: this.metaFormGroup.get('delivery_order')?.value,
      })
      .subscribe({
        next: (data: any) => {
          if (data === null) {
            this.apiService
              .post('good-receipt', {
                uuid: this.metaFormGroup.get('uuid')?.value,
                name: this.metaFormGroup.get('delivery_order')?.value,
                invoice_name: this.metaFormGroup.get('invoice_name')?.value ?? '',
                faktur: this.metaFormGroup.get('faktur')?.value || null,
                discount: Number(
                  this.metaFormGroup.get('document_discount')?.value ?? 0,
                ),
                is_confirm: this.dokumenLengkap,
                date: this.datePipe.transform(
                  this.metaFormGroup.get('date')?.value,
                  'yyyy-MM-dd'
                ),
                company_id: this.metaFormGroup.get('company_id')?.value,
                supplier_id: this.metaFormGroup.get('supplier_id')?.value,
                good_receipt: this.t.controls.map((x) => {
                  return {
                    product_id: x.get('product_id')?.value,
                    product_unit_id: x.get('product_unit_id')?.value,
                    quantity: x.get('quantity')?.value,
                    price: x.get('price')?.value,
                    discount: x.get('discount')?.value,
                  };
                }),
              })
              .subscribe({
                next: (_) => {
                  /* Harus sebelum t.clear(): barisnyalah yang dibaca. */
                  this.simpanHargaMaster();

                  this.t.clear();
                  this.metaFormGroup.reset();
                  this.onUnselectCompany();
                  this.onUnselectSupplier();

                  this.itemFormGroup.patchValue({
                    number_of_items: 0,
                  });

                  this.metaFormGroup.patchValue({
                    uuid: v4(),
                  });

                  this.alertService.showSuccess(
                    this.translateService.instant(
                      'good-receipt__create__success'
                    )
                  );
                },
                error: (error) => {
                  this.alertService.showError(error);
                },
              })
              .add(() => {
                this.isSubmitting = false;
              });

            return;
          }

          this.dialog
            .open(SubmitConfirmationComponent, {
              data: {
                title: this.translateService.instant(
                  'general__confirm-confirmation__body'
                ),
                document: `${data.name}, Supplier ${
                  data.supplier.name
                }, Date ${this.datePipe.transform(data.date, 'dd/MM/yyyy')}`,
              },
            })
            .afterClosed()
            .subscribe((validation) => {
              if (validation == true) {
                this.apiService
                  .post('good-receipt', {
                    uuid: this.metaFormGroup.get('uuid')?.value,
                    name: this.metaFormGroup.get('delivery_order')?.value,
                    date: this.datePipe.transform(
                      this.metaFormGroup.get('date')?.value,
                      'yyyy-MM-dd'
                    ),
                    company_id: this.metaFormGroup.get('company_id')?.value,
                    supplier_id: this.metaFormGroup.get('supplier_id')?.value,
                    good_receipt: this.t.controls.map((x) => {
                      return {
                        product_id: x.get('product_id')?.value,
                        product_unit_id: x.get('product_unit_id')?.value,
                        quantity: Number(x.get('quantity')?.value),
                        price: Number(x.get('price')?.value),
                        discount: Number(x.get('discount')?.value),
                      };
                    }),
                    invoice_name:
                      this.metaFormGroup.get('invoice_name')?.value ?? '',
                    faktur: this.metaFormGroup.get('faktur')?.value || null,
                    discount: Number(
                      this.metaFormGroup.get('document_discount')?.value ?? 0,
                    ),
                    is_confirm: this.dokumenLengkap,
                  })
                  .subscribe({
                    next: (_) => {
                      /* Harus sebelum t.clear(): barisnyalah yang dibaca. */
                      this.simpanHargaMaster();

                      this.t.clear();
                      this.metaFormGroup.reset();
                      this.onUnselectCompany();
                      this.onUnselectSupplier();

                      this.itemFormGroup.patchValue({
                        number_of_items: 0,
                      });

                      this.metaFormGroup.patchValue({
                        uuid: v4(),
                      });

                      this.alertService.showSuccess(
                        this.translateService.instant(
                          'good-receipt__create__success'
                        )
                      );
                    },
                    error: (error) => {
                      this.alertService.showError(error);
                    },
                  })
                  .add(() => {
                    this.isSubmitting = false;
                  });
              } else {
                this.isSubmitting = false;
              }
            });
        },
        error: (_) => {
          this.isSubmitting = false;
          this.alertService.showError('Error on fetching data');
        },
      });
  }
}
