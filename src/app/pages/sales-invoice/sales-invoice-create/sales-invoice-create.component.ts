import {
  DatePipe,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  DecimalPipe,
} from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteTrigger,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { KOLOM_ISIAN } from 'src/app/utils/keycode.utils';
import {
  Observable,
  Subject,
  debounceTime,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { SubmitConfirmationComponent } from 'src/app/components/submit-confirmation/submit-confirmation.component';
import { PackageSelectorComponent } from 'src/app/components/package-selector/package-selector.component';
import { PaymentSelectorComponent } from 'src/app/components/payment-selector/payment-selector.component';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/components/product-selector/product-selector.component';
import { SalesmanSelectorComponent } from 'src/app/components/salesman-selector/salesman-selector.component';
import { UpdatePackageSalesPriceComponent } from 'src/app/components/update-package-sales-price/update-package-sales-price.component';
import { UpdateProductSalesPriceComponent } from 'src/app/components/update-product-sales-price/update-product-sales-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { v4 } from 'uuid';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
  MatHint,
  MatPrefix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepickerInput,
  MatDatepicker,
} from '@angular/material/datepicker';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { NgxMaskDirective } from 'ngx-mask';
import { MatTooltip } from '@angular/material/tooltip';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerCreateComponent } from 'src/app/pages/customer/customer-create/customer-create.component';
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  SERVICE_TYPES,
  ServiceType,
} from 'src/app/constants/service-type.constant';

@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-sales-invoice-create',
  templateUrl: './sales-invoice-create.component.html',
  styleUrls: ['./sales-invoice-create.component.scss'],
  /*
      Kerangka Material dilepas hampir seluruhnya. Yang tersisa hanya
      NgxMaskDirective untuk pemisah ribuan dan app-autocomplete-search untuk
      pemilih pelanggan; sisanya digambar sendiri lewat kelas Nocturne.
    */
  imports: [
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatSelect,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteSearchComponent,
    NgxMaskDirective,
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class SalesInvoiceCreateComponent {
  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private apiService: ApiService,
    private _hotkeysService: HotkeysService,
    private router: Router,
    private datePipe: DatePipe,
    private sheet: MatBottomSheet,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
  ) {
    this._hotkeysService.add([
      new Hotkey(
        'alt+a',
        (event: KeyboardEvent): boolean => {
          this.openItemSelector();
          return false; // Prevent bubbling
        },
        KOLOM_ISIAN,
      ),
      new Hotkey(
        'alt+s',
        (event: KeyboardEvent): boolean => {
          if (
            this.billFormGroup.valid &&
            this.valueFormGroup.valid &&
            this.paymentsFormGroup.valid &&
            this.metaFormGroup.valid
          ) {
            this.submitForm();
          } else {
            console.error(`[error]: ${this.metaFormGroup.errors}`);
            this.alertService.showSuccess(
              this.translateService.instant('general__check-input'),
            );
          }
          return false;
        },
        KOLOM_ISIAN,
      ),
    ]);

    const url = this.router.url;
    this.isAdministrator = url.split('/')[1] == 'Administrator';
  }

  salesmen: string[] = [];
  isSubmitting: boolean = false;
  isAdministrator: boolean = false;

  /*
    Berbeda dari isAdministrator di atas, yang diambil dari potongan ALAMAT
    ("/Administrator/..."). Yang menentukan boleh-tidaknya menimpa harga master
    adalah PERAN penggunanya, dan itu yang dijaga administratorMiddleware di
    server. Mengirim baris save_price tanpa hak hanya menghasilkan 403 setelah
    fakturnya terlanjur tersimpan.
  */
  bolehSimpanKeMaster = inject(AuthService).isAdministrator();
  customerOptions: any[] = [];
  paymentOptions: any[] = [];
  unit_selection: any[] = [];
  productSelectorSubject: Subject<any> = new Subject();

  @ViewChild('trigger') trigger: MatAutocompleteTrigger | undefined;
  @ViewChild('input') input: any;

  NotZero: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    return Number(control.value) != 0 ? null : { error: true };
  };

  paymentValidator: ValidatorFn = (
    group: AbstractControl,
  ): ValidationErrors | null => {
    const payments = (group.get('payments') as FormArray)?.value || [];
    const sales = this.metaFormGroup?.get('sales')?.value;
    const hasInvalidPayment = payments.some(
      (p: any) => p.payment_method_id === 0,
    );
    let invalidInternalPayment =
      (sales === 'INTERNAL' || sales === '' || sales === null) &&
      hasInvalidPayment
        ? this.translateService.instant('sales-invoice__create__payment__dor')
        : null;

    if (invalidInternalPayment == null) {
      return null;
    }

    return {
      invalidInternalPayment: invalidInternalPayment,
    };
  };

  onSelectCustomer(data: any) {
    this.metaFormGroup.patchValue({
      customer_id: data.id,
    });
  }

  onUnselectCustomer() {
    this.metaFormGroup.patchValue({
      customer_id: null,
    });
  }

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4()),
    customer_id: new FormControl(0, Validators.required),
    date: new FormControl(new Date(), Validators.required),
    type: new FormControl('sales', [
      Validators.required,
      Validators.pattern('sales|deposit|deposit-internal'),
    ]),
    sales: new FormControl('', Validators.required),
  });

  billFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  /*
    Tidak ada lagi kontrol `method`: status pembayaran DITURUNKAN dari isi
    pembayarannya (lihat statusBayar), bukan dipilih. due_time ikut pergi —
    nilainya tidak pernah dikirim ke server sejak dulu.
  */
  paymentsFormGroup: FormGroup = new FormGroup(
    {
      payments: new FormArray([]),
    },
    [this.paymentValidator],
  );

  valueFormGroup: FormGroup = new FormGroup({
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    delivery: new FormControl(0, [Validators.required, Validators.min(0)]),
    service: new FormControl(0, [Validators.required, Validators.min(0)]),
    /*
      Jenis jasa. Dimulai mati karena biaya jasanya nol — server menolak jenis
      yang disebutkan tanpa biaya, jadi keadaan awalnya harus kosong dan tidak
      bisa diisi.
    */
    service_type: new FormControl<ServiceType | null>({
      value: null,
      disabled: true,
    }),
    before: new FormControl(0, [Validators.required, Validators.min(0)]),
    total: new FormControl(0, [Validators.required, Validators.min(0)]),
    grand_total: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  readonly jenisJasa = SERVICE_TYPES;

  get f() {
    return this.billFormGroup.controls;
  }
  get t() {
    return this.f['items'] as FormArray;
  }

  get g() {
    return this.paymentsFormGroup.controls;
  }

  get p() {
    return this.g['payments'] as FormArray;
  }

  get totalPayment() {
    const result = this.p.value.reduce((a: any, b: any) => {
      return a + b['value'];
    }, 0);

    return result;
  }

  get totalBill() {
    if (
      !this.valueFormGroup ||
      !this.valueFormGroup.controls['total'] ||
      !this.valueFormGroup.controls['delivery'] ||
      !this.valueFormGroup.controls['service'] ||
      !this.valueFormGroup.controls['discount']
    ) {
      return 0;
    }
    return (
      this.valueFormGroup.controls['total'].value +
      this.valueFormGroup.controls['delivery'].value +
      this.valueFormGroup.controls['service'].value -
      this.valueFormGroup.controls['discount'].value
    );
  }

  viewSalesman() {
    this.dynamicComponentService.createDynamicComponent(
      SalesmanSelectorComponent,
      {},
    );
  }

  ngOnInit(): void {
    /* Jalan pulang ke daftar faktur ada di topbar, seperti penerimaan barang. */
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'sales-invoice__title',
      kembaliJalur: '/Sales-invoice/Archive',
      tag: 'sales-invoice__new',
    });

    this.perbaruiRingkasanBaris();
    this.perbaruiChecklist();

    this.metaFormGroup.valueChanges.subscribe(() => this.perbaruiChecklist());
    this.paymentsFormGroup.valueChanges.subscribe(() =>
      this.perbaruiChecklist(),
    );

    this.t.valueChanges.subscribe(() => {
      this.perbaruiRingkasanBaris();
      this.perbaruiChecklist();
      this.valueFormGroup.patchValue({
        total: this.t.value.reduce((a: any, b: any) => {
          return a + b.quantity * (b.price - b.discount);
        }, 0),
        before: this.t.value.reduce((a: any, b: any) => {
          return a + b.quantity * b.price;
        }, 0),
      });
    });

    this.valueFormGroup.valueChanges.subscribe((values) => {
      const subtotal = Number(this.valueFormGroup.value.total);
      const discount = Number(this.valueFormGroup.value.discount);
      const delivery = Number(this.valueFormGroup.value.delivery);
      const service = Number(this.valueFormGroup.value.service);

      this.valueFormGroup.patchValue(
        {
          grand_total: subtotal + delivery + service - discount,
        },
        { emitEvent: false },
      );

      /*
        Diskon berubah → nominal pengembalian ikut, selama pengguna belum
        menyuntingnya sendiri.
      */
      this.autoIsiNominal();
    });

    /*
      Jenis jasa hanya hidup selama ada biayanya.

      Server menolak dua-duanya: biaya tanpa jenis, dan jenis tanpa biaya.
      Aturan itu ditegakkan di sini dengan mematikan kendalinya, bukan dengan
      pesan galat setelah tombol simpan ditekan — bidang yang mati sudah
      menjelaskan dirinya sendiri, sementara galat yang baru muncul di akhir
      menuntut orang menebak bidang mana yang dimaksud.

      Jenis yang sempat terisi ikut dikosongkan ketika biayanya kembali nol.
      Membiarkannya berarti mengirim jenis tanpa biaya — persis bentuk yang
      ditolak server, tetapi tak terlihat karena kendalinya sudah mati.
    */
    this.valueFormGroup.controls['service'].valueChanges.subscribe((nilai) => {
      const jenis = this.valueFormGroup.controls['service_type'];
      const adaBiaya = Number(nilai) > 0;

      if (adaBiaya && jenis.disabled) {
        jenis.enable({ emitEvent: false });
      } else if (!adaBiaya && jenis.enabled) {
        jenis.setValue(null, { emitEvent: false });
        jenis.disable({ emitEvent: false });
      }
    });

    this.apiService
      .get('payment-method/all', {
        keyword: '',
        page: 1,
      })
      .subscribe({
        next: (data: any) => {
          this.paymentOptions = data;
        },
      });

    this.metaFormGroup.controls['sales'].valueChanges
      .pipe(debounceTime(500))
      .subscribe((_) => {
        this.fetchSalesmen();
      });
  }

  ngOnDestroy(): void {
    this._hotkeysService.reset();
  }

  fetchSalesmen() {
    this.apiService
      .get('salesman', {
        keyword: this.metaFormGroup.controls['sales'].value,
        page: 1,
      })
      .subscribe({
        next: (data: any) => {
          this.salesmen = data;
        },
      });
  }

  openItemSelector() {
    this.productSelectorSubject =
      this.dynamicComponentService.createDynamicComponent(
        ProductSelectorComponent,
        {
          type: ProductSelectorType.sales,
        },
      );

    this.productSelectorSubject.subscribe((result: any) => {
      if (result == undefined) {
        return;
      }

      if (result) {
        const data = result.data;
        const sub = result.sub;
        const check = this.checkExistingProduct(
          data.id,
          sub == null ? null : sub.id,
        );

        if (check) {
          this.alertService.showSuccess(
            this.translateService.instant('general__item__exists'),
          );
          return;
        }

        this.apiService.get(`product-stock/product/${data.id}`).subscribe({
          next: (stock: any) => {
            /*
              Balasannya bersarang: { stock: { product_id, stock } }.
              Pembacaan lama (stock.stock) mengambil objeknya sehingga
              angka stok di baris diam-diam kosong sejak dulu.
            */
            const stokProduk = Number(stock?.stock?.stock ?? 0);
            if (sub == null) {
              this.t.push(
                this.formBuilder.group({
                  product_id: [data.id, Validators.required],
                  product_unit_id: [null],
                  reference: [data.reference],
                  description: [data.description],
                  quantity: ['', [Validators.required, Validators.min(0.01)]],
                  initial_price: [
                    data.sales_price,
                    [Validators.required, Validators.min(0)],
                  ],
                  price: [
                    data.sales_price,
                    [Validators.required, Validators.min(0)],
                  ],
                  initial_discount: [
                    data.sales_discount,
                    [Validators.required, Validators.min(0)],
                  ],
                  discount: [
                    data.sales_discount,
                    [Validators.required, Validators.min(0)],
                  ],
                  unit: [data.unit],
                  conversion: [1],
                  default_unit: [data.unit],
                  save_price: [false],
                  stock: [stokProduk],
                }),
              );
            } else {
              this.t.push(
                this.formBuilder.group({
                  product_id: [data.id, Validators.required],
                  product_unit_id: [sub.id],
                  reference: [data.reference],
                  description: [data.description],
                  quantity: [0, [Validators.required, Validators.min(0.01)]],
                  initial_price: [
                    sub.sales_price,
                    [Validators.required, Validators.min(0)],
                  ],
                  price: [
                    sub.sales_price,
                    [Validators.required, Validators.min(0)],
                  ],
                  initial_discount: [
                    sub.sales_discount,
                    [Validators.required, Validators.min(0)],
                  ],
                  discount: [
                    sub.sales_discount,
                    [Validators.required, Validators.min(0)],
                  ],
                  unit: [sub.unit],
                  conversion: [sub.conversion],
                  default_unit: [data.unit],
                  save_price: [false],
                  stock: [stokProduk],
                }),
              );
            }

            this.billFormGroup.patchValue({
              number_of_items: this.t.length,
            });

            setTimeout(() => {
              const autofocusLength =
                document.querySelectorAll('[focusedInput]').length;
              const input =
                document.querySelectorAll('[focusedInput]')[
                  autofocusLength - 1
                ];
              (input as HTMLElement).focus();
            }, 100);
          },
          error: (error) => {
            this.alertService.showError(error);
            return;
          },
        });
      } else {
        this.alertService.showSuccess(
          this.translateService.instant('general__item__exists'),
        );
      }
    });
  }

  private checkExistingProduct(
    productID: number,
    productUnitID: number | null,
  ) {
    const result = this.t.value.findIndex((x: any) => {
      return x.product_id == productID && x.product_unit_id == productUnitID;
    });

    return result == -1 ? false : true;
  }

  openPackageSelector() {
    this.dynamicComponentService
      .createDynamicComponent(PackageSelectorComponent, {
        /* Untuk lencana "sudah di faktur" pada baris pemilihnya. */
        barisSaatIni: () =>
          this.t.controls
            .map((x) => x.get('package_code_id')?.value)
            .filter((id) => id != null),
      })
      .subscribe((data) => {
        if (data) {
          const result = this.checkExistingPackage(data.item.id);
          if (result) {
            this.alertService.showSuccess(
              this.translateService.instant('general__item__exists'),
            );
            return;
          }

          this.apiService
            .get(`product-stock/package/${data.item.id}`)
            .subscribe({
              next: (stock: any) => {
                this.t.push(
                  this.formBuilder.group({
                    package_code_id: [data.item.id, Validators.required],
                    name: [data.item.name, Validators.required],
                    description: [data.item.description, Validators.required],
                    quantity: [0, [Validators.required, Validators.min(1)]],
                    initial_price: [data.item.price],
                    package_content: [
                      data.item.package_content.map((x: any) => {
                        const index = stock.findIndex(
                          (y: any) => y.product_id == x.product_id,
                        );
                        return {
                          ...x,
                          stock: index == -1 ? 0 : stock[index].stock,
                        };
                      }),
                    ],
                    price: [
                      data.item.price,
                      [Validators.min(0), Validators.required],
                    ],
                    discount: [0],
                    save_price: [false],
                  }),
                );

                this.billFormGroup.patchValue({
                  number_of_items: this.t.length,
                });

                setTimeout(() => {
                  const autofocusLength =
                    document.querySelectorAll('[focusedInput]').length;
                  const input =
                    document.querySelectorAll('[focusedInput]')[
                      autofocusLength - 1
                    ];
                  (input as HTMLElement).focus();
                }, 100);
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            });
        }
      });
  }

  private checkExistingPackage(productPackageID: number) {
    const result = this.t.value.findIndex((x: any) => {
      return x.package_code_id == productPackageID;
    });

    return result == -1 ? false : true;
  }

  openPaymentSelector() {
    this.sheet
      .open(PaymentSelectorComponent, {
        data: this.paymentOptions,
      })
      .afterDismissed()
      .subscribe((data: any) => {
        if (data) {
          const result = this.checkExistingPaymentMethod(data.id);
          if (result) {
            this.alertService.showSuccess(
              this.translateService.instant(
                'sales-invoice__create__payment-method__exists',
              ),
            );
            return;
          }

          const requiredPayments = this.totalBill - this.totalPayment;

          this.p.push(
            this.formBuilder.group({
              payment_method_id: new FormControl(data.id),
              payment_name: new FormControl(data.name, Validators.required),
              payment_description: new FormControl(data.description),
              value: new FormControl(requiredPayments, [
                Validators.required,
                Validators.minLength(1),
                Validators.nullValidator,
                this.NotZero,
              ]),
            }),
          );
        }
      });
  }

  private checkExistingPaymentMethod(paymentMethodID: number | null) {
    const payments = this.p.value;
    const result = payments.findIndex((x: any) => {
      return x.id == paymentMethodID;
    });

    return result == -1 ? false : true;
  }

  updatePrice(i: number) {
    const sheet = this.sheet.open(UpdateProductSalesPriceComponent, {
      data: {
        reference: this.getFormGroupAt(i).get('reference')?.value,
        unit: this.getFormGroupAt(i).get('unit')?.value,
        initial_price: this.getFormGroupAt(i).get('initial_price')?.value,
        initial_discount: this.getFormGroupAt(i).get('initial_discount')?.value,
        price: this.getFormGroupAt(i).get('price')?.value,
        discount: this.getFormGroupAt(i).get('discount')?.value,
        save_price: this.getFormGroupAt(i).get('save_price')?.value,
      },
    });

    sheet.afterDismissed().subscribe((data) => {
      if (data) {
        this.getFormGroupAt(i).patchValue({
          initial_price: data.initial_price,
          initial_discount: data.initial_discount,
          price: data.price,
          discount: data.discount,
          save_price: data.save_price,
        });
      }
    });
  }

  updatePackagePrice(i: number) {
    const sheet = this.sheet.open(UpdatePackageSalesPriceComponent, {
      data: {
        initial_price: this.getFormGroupAt(i).get('initial_price')?.value,
        price: this.getFormGroupAt(i).get('price')?.value,
        save_price: this.getFormGroupAt(i).get('save_price')?.value,
      },
    });

    sheet.afterDismissed().subscribe((data) => {
      if (data) {
        this.getFormGroupAt(i).patchValue({
          initial_price: data.initial_price,
          price: data.price,
          save_price: data.save_price,
        });
      }
    });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  getFormGroupAtPayment(i: number) {
    return this.p.at(i) as FormGroup;
  }

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.billFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  deletePayment(i: number) {
    this.p.removeAt(i);
  }

  submitForm() {
    if (!this.isValid) {
      console.error(`[errror]: ${this.metaFormGroup.errors}`);
      this.alertService.showSuccess(
        this.translateService.instant('general__check-input'),
      );
      return;
    }

    if (this.totalPayment > this.totalBill) {
      console.error(`[error]: Payment is greater than the sales invoice`);
      this.alertService.showSuccess(
        this.translateService.instant(
          'sales-invoice__create__payment__greater-error',
        ),
      );
    }

    this.isSubmitting = true;

    const sales_invoice: any[] = [];
    const date = this.metaFormGroup.controls['date'].value;
    for (let i = 0; i < this.t.controls.length; i++) {
      const item = this.t.controls[i];
      const packageCodeID = item.get('package_code_id')?.value;
      if (packageCodeID) {
        const packageQuantity = Number(item.get('quantity')?.value);
        const packagePrice = Number(item.get('price')?.value);
        const package_content = item.get('package_content')?.value;
        const realValue = package_content.reduce((a: any, b: any) => {
          return a + b.price * b.quantity;
        }, 0);

        for (let j = 0; j < package_content.length; j++) {
          const price = package_content[j].price;
          const correctedPrice = ((price * packagePrice) / realValue).toFixed(
            2,
          );
          sales_invoice.push({
            price: correctedPrice,
            product_id: package_content[j].product_id,
            product_unit_id: package_content[j].product_unit_id,
            quantity: package_content[j].quantity * packageQuantity,
            discount: 0,
          });
        }
      } else {
        const product_id = item.get('product_id')?.value;
        const product_unit_id = item.get('product_unit_id')?.value;
        const price = Number(item.get('price')?.value);
        const discount = Number(item.get('discount')?.value);
        const quantity = Number(item.get('quantity')?.value);

        sales_invoice.push({
          price: price,
          discount: discount,
          quantity: quantity,
          product_unit_id: product_unit_id,
          product_id: product_id,
        });
      }
    }

    const sales_invoice_code = {
      /*
        Pengembalian diskon. Dikirim null ketika diskonnya memang hanya
        dipotong di faktur — server membedakan keduanya dari ada-tidaknya isi
        ruas ini, bukan dari nilai nol, sebab nol bisa berarti "dikembalikan
        tetapi nominalnya belum diisi".
      */
      rebate:
        this.perlakuanDiskon === 'kembali'
          ? {
              value: this.nominalKembali,
              payment_method_id: null,
              method: this.metodeKembali,
              receiver_name: this.rebateFormGroup.value.receiver_name,
              bank_name:
                this.metodeKembali === 'Cash'
                  ? null
                  : this.rebateFormGroup.value.bank_name,
              account_number:
                this.metodeKembali === 'Cash'
                  ? null
                  : this.rebateFormGroup.value.account_number,
            }
          : null,
      sales:
        this.metaFormGroup.controls['sales'].value == 'INTERNAL'
          ? null
          : this.metaFormGroup.controls['sales'].value,
      uuid: this.metaFormGroup.controls['uuid'].value,
      date: this.datePipe.transform(date, 'yyyy-MM-dd'),
      customer_id:
        this.metaFormGroup.controls['customer_id'].value == 0
          ? null
          : this.metaFormGroup.controls['customer_id'].value,
      type: this.metaFormGroup.controls['type'].value,
      discount: this.valueFormGroup.controls['discount'].value,
      delivery: this.valueFormGroup.controls['delivery'].value,
      service: this.valueFormGroup.controls['service'].value,
      service_type: this.valueFormGroup.controls['service_type'].value ?? null,
      sales_invoice: sales_invoice,
      sales_invoice_payment: this.p.controls.map((x) => {
        return {
          date: this.datePipe.transform(date, 'yyyy-MM-dd'),
          payment_method_id: x.get('payment_method_id')?.value,
          value: x.get('value')?.value,
        };
      }),
      is_paid: this.statusBayar === 'paid',
    };

    let submitFunction = null;
    const type = this.metaFormGroup.controls['type'].value;

    if (type == 'sales') {
      submitFunction = this.apiService.post(
        'sales-invoice',
        sales_invoice_code,
      );
    } else if (type == 'deposit') {
      submitFunction = this.apiService.post('sales-deposit', {
        ...sales_invoice_code,
        type: 'INTERNAL',
      });
    } else {
      submitFunction = this.apiService.post('sales-deposit', {
        ...sales_invoice_code,
        type: 'INTERNAL',
      });
    }

    submitFunction
      .pipe(
        switchMap((result) => {
          const itemsToSave = this.t.controls
            .filter(
              (x) =>
                this.bolehSimpanKeMaster &&
                x.get('package_code_id')?.value == null &&
                x.get('save_price')?.value,
            )
            .map((x) => ({
              product_id: x.get('product_id')?.value,
              product_unit_id: x.get('product_unit_id')?.value,
              price: x.get('price')?.value,
              discount: x.get('discount')?.value,
            }));

          if (itemsToSave.length > 0) {
            // Post to purchase-price
            return this.apiService.put('product/price-sales', {
              items: itemsToSave,
            });
          }

          return of(null);
        }),
        switchMap((productPriceResult) => {
          const itemsToSave = this.t.controls
            .filter(
              (x) =>
                this.bolehSimpanKeMaster &&
                x.get('package_code_id')?.value != null &&
                x.get('save_price')?.value,
            )
            .map((x) => ({
              package_code_id: x.get('package_code_id')?.value,
              price: x.get('price')?.value,
            }));

          if (itemsToSave.length > 0) {
            // Post to purchase-price
            return this.apiService.put('product-package/price-sales', {
              items: itemsToSave,
            });
          }

          return of(null);
        }),
      )
      .subscribe({
        next: (result: any) => {
          const type = this.metaFormGroup.controls['type'].value;
          if (type == 'sales') {
            this.alertService.showSuccess(
              this.translateService.instant('sales-invoice__create__success'),
            );
          } else {
            this.alertService.showSuccess(
              this.translateService.instant('sales-deposit__create__success'),
            );
          }

          this.t.clear();
          this.valueFormGroup.reset();
          this.billFormGroup.reset();
          this.valueFormGroup.patchValue({
            discount: 0,
            service: 0,
            delivery: 0,
            total: 0,
            before: 0,
          });
          this.metaFormGroup.patchValue({
            uuid: v4(),
            sales: '',
            date: new Date(),
            type: 'sales',
          });

          this.p.clear();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  get isValid(): boolean {
    /* Pengembalian yang setengah terisi tidak boleh ikut terbit. */
    if (!this.pengembalianLengkap) {
      return false;
    }

    if (
      !this.metaFormGroup.valid ||
      !this.billFormGroup.valid ||
      !this.valueFormGroup.valid ||
      !this.paymentsFormGroup.valid
    ) {
      return false;
    }

    if (this.totalPayment > this.totalBill) {
      return false;
    }

    /* Deposit internal tidak membawa pembayaran; barisnya dibuang saat tipe
       dipilih, penjaga ini menutup celah sisanya. */
    const type = this.metaFormGroup.get('type')?.value;
    if (type == 'deposit-internal' && this.totalPayment > 0) {
      return false;
    }

    return true;
  }

  /*
    Dipanggil KeluarTanpaSimpanGuard. Dialog aplikasi sendiri, bukan
    window.confirm — dialog natif tidak bertema, kalimat lamanya pun
    tertulis mati dalam bahasa Inggris, dan pada browser tertanam ia
    disupresi diam-diam.
  */
  canExit(): boolean | Observable<boolean> {
    const kotor =
      this.billFormGroup.dirty ||
      this.metaFormGroup.dirty ||
      this.valueFormGroup.dirty;

    if (!kotor) {
      return true;
    }

    return this.dialog
      .open(SubmitConfirmationComponent, {
        data: {
          title: this.translateService.instant('general__unsaved-exit-confirm'),
        },
      })
      .afterClosed()
      .pipe(map((setuju) => !!setuju));
  }
  /* ---------------------------------------------------------------- */
  /* Pilihan berbentuk kartu                                           */
  /* ---------------------------------------------------------------- */

  readonly tipeTransaksi = [
    {
      nilai: 'sales',
      kunci: 'sales-invoice__create__type__sales',
      desk: 'sales-invoice__type__sales__desk',
      note: 'sales-invoice__type__sales__note',
      ikon: 'ph-receipt',
    },
    {
      nilai: 'deposit',
      kunci: 'sales-invoice__create__type__deposit',
      desk: 'sales-invoice__type__deposit__desk',
      note: 'sales-invoice__type__deposit__note',
      ikon: 'ph-hand-coins',
    },
    {
      nilai: 'deposit-internal',
      kunci: 'sales-invoice__create__type__internal-deposit',
      desk: 'sales-invoice__type__internal__desk',
      note: 'sales-invoice__type__internal__note',
      ikon: 'ph-lock-key',
    },
  ];

  /** Deposit internal tidak membawa pembayaran sama sekali. */
  get depositInternal(): boolean {
    return this.metaFormGroup.value.type === 'deposit-internal';
  }

  /*
    Status pembayaran DITURUNKAN dari isinya: penuh berarti lunas, sebagian
    cicilan, kosong tanpa pembayaran. Dulu ada tiga kartu pilihan yang wajib
    diklik cocok dengan isiannya — pekerjaan ganda yang validatornya sendiri
    menolak bila tidak sinkron, jadi tidak pernah ada informasi tambahan.
  */
  get statusBayar(): 'paid' | 'underpaid' | 'unpaid' | 'over' {
    if (this.totalPayment <= 0) {
      return 'unpaid';
    }
    /*
      Melebihi total — termasuk membayar faktur yang totalnya masih nol —
      bukan cicilan dan bukan lunas: keadaan tidak sah yang harus disebut
      terang-terangan. Tombol terbitkan mati selama keadaan ini.
    */
    if (this.totalPayment > this.totalBill) {
      return 'over';
    }
    return this.totalPayment >= this.totalBill ? 'paid' : 'underpaid';
  }

  pilihTipe(nilai: string): void {
    this.metaFormGroup.patchValue({ type: nilai });

    /*
      Deposit internal tidak membawa pembayaran: baris yang telanjur diisi
      dibuang, bukan disembunyikan — kalau cuma disembunyikan, nilainya ikut
      terkirim diam-diam saat faktur terbit.
    */
    if (nilai === 'deposit-internal') {
      this.p.clear();
    }
  }

  /*
    Nama sales ditulis huruf besar. Dikerjakan lewat kontrol formulirnya, bukan
    atribut oninput pada elemennya seperti sebelumnya: yang kedua mengubah isi
    kotaknya tanpa memberi tahu Angular, sehingga yang tersimpan tetap ejaan
    lama dan yang terkirim ke server bukan yang terbaca di layar.
  */
  besarkanSales(event: Event): void {
    const nilai = (event.target as HTMLInputElement).value.toUpperCase();
    this.metaFormGroup.controls['sales'].setValue(nilai, { emitEvent: true });
  }

  tambahPelanggan(): void {
    this.dialog.open(CustomerCreateComponent, {
      panelClass: 'nocturne-dialog',
      backdropClass: 'nocturne-dialog-backdrop',
    });
  }

  batal(): void {
    this.router.navigate(['/Sales-invoice/Archive']);
  }

  /* ---------------------------------------------------------------- */
  /* Pembacaan baris                                                   */
  /* ---------------------------------------------------------------- */

  private baris(i: number) {
    return this.t.at(i) as FormGroup;
  }

  /* ---------------------------------------------------------------- */
  /* Ringkasan lintas baris                                            */
  /* ---------------------------------------------------------------- */

  /*
    jumlahDuplikat dan kebutuhanBaris sama-sama menjawab pertanyaan tentang
    SELURUH dokumen, tetapi template memanggilnya sekali untuk SETIAP baris.
    Bentuk lamanya menyapu seluruh baris di dalam tiap panggilan, sehingga
    biayanya kuadratik — dan karena pemanggilnya template, sapuan itu terulang
    pada setiap siklus deteksi perubahan, yakni setiap ketukan tombol. Faktur
    berisi lima puluh baris berarti dua ribu lima ratus perbandingan setiap
    kali kasir menekan satu angka.

    Sekarang keduanya dihitung sekali setiap nilai berubah, lalu dibaca dari
    peta ini dalam waktu tetap. Hasilnya identik; yang berpindah hanya kapan
    menghitungnya.
  */
  private hitunganKembar = new Map<string, number>();
  private kebutuhanPerProduk = new Map<unknown, number>();

  /** Paket dan barang biasa dibedakan supaya keduanya tidak saling hitung. */
  private kunciBarang(nilai: any): string {
    return nilai.package_code_id
      ? `p${nilai.package_code_id}`
      : `b${nilai.product_id}-${nilai.product_unit_id ?? ''}`;
  }

  private perbaruiRingkasanBaris(): void {
    const kembar = new Map<string, number>();
    const kebutuhan = new Map<unknown, number>();

    for (const kontrol of this.t.controls) {
      const nilai = kontrol.value;

      const kunci = this.kunciBarang(nilai);
      kembar.set(kunci, (kembar.get(kunci) ?? 0) + 1);

      const perlu = Number(nilai.quantity ?? 0) * Number(nilai.conversion ?? 1);
      kebutuhan.set(
        nilai.product_id,
        (kebutuhan.get(nilai.product_id) ?? 0) + perlu,
      );
    }

    this.hitunganKembar = kembar;
    this.kebutuhanPerProduk = kebutuhan;
  }

  /** Paket memakai `name`, barang biasa memakai `reference`. */
  namaBaris(i: number): string {
    const b = this.baris(i).value;
    return b.package_code_id ? b.name : b.reference;
  }

  deskripsiBaris(i: number): string {
    return this.baris(i).value.description ?? '';
  }

  stokBaris(i: number): number | null {
    const stok = this.baris(i).value.stock;
    return stok == null ? null : Number(stok);
  }

  /*
    Peringatan stok minus — peringatan, bukan blokir: faktur memang boleh
    membuat stok minus (barang kadang terjual sebelum penerimaannya
    tercatat), tapi kasir harus sadar sebelum menyimpan. Kebutuhannya
    dihitung agregat per produk supaya dua baris barang yang sama saling
    menjumlah, dalam satuan dasar.
  */
  kebutuhanBaris(i: number): number {
    return this.kebutuhanPerProduk.get(this.baris(i).value.product_id) ?? 0;
  }

  bakalMinus(i: number): boolean {
    const stok = this.stokBaris(i);
    if (stok == null) {
      return false;
    }
    return this.kebutuhanBaris(i) > stok;
  }

  nilaiBaris(i: number, ruas: string): number {
    return Number(this.baris(i).value[ruas] ?? 0);
  }

  satuanBaris(i: number): string {
    return this.baris(i).value.unit ?? '';
  }

  /** "3 box = 300 pcs", atau kosong bila satuannya memang satuan dasar. */
  konversiBaris(i: number): string {
    const b = this.baris(i).value;
    const konversi = Number(b.conversion ?? 1);
    if (konversi === 1 || !b.quantity) {
      return '';
    }

    const jumlah = Number(b.quantity) * konversi;
    return `${b.quantity} ${b.unit} = ${jumlah} ${b.default_unit}`;
  }

  totalBaris(i: number): number {
    const b = this.baris(i).value;
    const harga = Number(b.price ?? 0);
    const diskon = b.package_code_id ? 0 : Number(b.discount ?? 0);
    return Number(b.quantity ?? 0) * (harga - diskon);
  }

  /**
   * Berapa kali barang pada baris ini muncul di seluruh dokumen.
   *
   * Barang yang sama BOLEH muncul lebih dari sekali — bonus supplier, atau
   * harga berbeda dalam satu faktur. Karena itu hasilnya dipakai sebagai
   * peringatan halus, bukan larangan.
   */
  jumlahDuplikat(i: number): number {
    return this.hitunganKembar.get(this.kunciBarang(this.baris(i).value)) ?? 0;
  }

  simpanHarga(i: number): boolean {
    return !!this.baris(i).value.save_price;
  }

  toggleSimpanHarga(i: number): void {
    const kontrol = this.baris(i).controls['save_price'];
    kontrol.setValue(!kontrol.value);
  }

  /** Paket dan barang biasa punya dialog harga yang berbeda. */
  ubahHarga(i: number): void {
    if (this.baris(i).value.package_code_id) {
      this.updatePackagePrice(i);
    } else {
      this.updatePrice(i);
    }
  }

  namaBayar(i: number): string {
    return (this.p.at(i) as FormGroup).value.payment_name ?? '';
  }

  deskripsiBayar(i: number): string {
    return (this.p.at(i) as FormGroup).value.payment_description ?? '';
  }

  /* ---------------------------------------------------------------- */
  /* Ringkasan                                                         */
  /* ---------------------------------------------------------------- */

  /* ---------------------------------------------------------------- */
  /* Pengembalian diskon                                               */
  /* ---------------------------------------------------------------- */

  /**
   * Perlakuan diskon: 'faktur' (dipotong di faktur saja) atau 'kembali'
   * (dikembalikan sebagai uang).
   *
   * BUKAN saklar boolean. Keduanya keputusan setara yang akibatnya
   * berlawanan — yang pertama tidak mengeluarkan uang sama sekali, yang kedua
   * mengurangi kas — jadi keduanya harus disebut namanya.
   */
  perlakuanDiskon: 'faktur' | 'kembali' = 'faktur';

  /** 'Cash' atau 'Bank transfer'; ejaannya sama dengan yang dikirim server. */
  metodeKembali: string = 'Cash';

  rebateFormGroup: FormGroup = new FormGroup({
    value: new FormControl(0),
    receiver_name: new FormControl(''),
    bank_name: new FormControl(''),
    account_number: new FormControl(''),
  });

  /**
   * Benar setelah pengguna menyunting nominal pengembalian dengan
   * tangannya sendiri. Sebelum itu, nominalnya MENGIKUTI total diskon:
   * diskon diubah, nominal ikut. Sesudahnya angka pengguna yang menang.
   */
  nominalDisunting = false;

  /**
   * Memilih perlakuan diskon.
   *
   * Berpindah ke "dikembalikan" mengisi nominalnya dengan total diskon faktur
   * — angka yang hampir selalu benar, dan tetap boleh diubah. Berpindah balik
   * MENGOSONGKAN seluruh isian: kalau dibiarkan, nama penerima dan nomor
   * rekening yang telanjur diketik ikut terkirim pada faktur yang sebenarnya
   * tidak mengeluarkan uang sepeser pun.
   */
  pilihPerlakuan(pilihan: 'faktur' | 'kembali'): void {
    this.perlakuanDiskon = pilihan;

    if (pilihan === 'kembali') {
      this.autoIsiNominal();
      return;
    }

    this.nominalDisunting = false;
    this.rebateFormGroup.reset({
      value: 0,
      receiver_name: '',
      bank_name: '',
      account_number: '',
    });
  }

  /**
   * Nilai bawaan nominal pengembalian: total diskon, dijepit nilai nett
   * bon — mengembalikan lebih dari nilai bonnya sendiri bukan
   * pengembalian diskon lagi.
   */
  private autoIsiNominal(): void {
    if (this.perlakuanDiskon !== 'kembali' || this.nominalDisunting) {
      return;
    }

    const bawaan = Math.min(this.totalDiskon, Math.max(this.totalBill, 0));
    if (Number(this.rebateFormGroup.value.value) !== bawaan) {
      this.rebateFormGroup.patchValue({ value: bawaan }, { emitEvent: false });
    }
  }

  /** Dipanggil dari ketikan langsung pada kolom nominal. */
  nominalDiedit(): void {
    this.nominalDisunting = true;
  }

  /** Jepit nominal ke nilai nett bon saat pengguna meninggalkan kolomnya. */
  jepitNominal(): void {
    const maks = Math.max(this.totalBill, 0);
    if (this.nominalKembali > maks) {
      this.rebateFormGroup.patchValue({ value: maks }, { emitEvent: false });
    }
  }

  pilihMetodeKembali(pilihan: string): void {
    this.metodeKembali = pilihan;

    /* Bank dan nomor akun tidak berlaku pada pengembalian tunai. */
    if (pilihan === 'Cash') {
      this.rebateFormGroup.patchValue({ bank_name: '', account_number: '' });
    }
  }

  /** Total diskon faktur — nilai bawaan nominal pengembalian. */
  get totalDiskon(): number {
    return this.diskonItem + Number(this.valueFormGroup.value.discount ?? 0);
  }

  get nominalKembali(): number {
    return Number(this.rebateFormGroup.value.value) || 0;
  }

  /**
   * Benar bila pengembaliannya sudah cukup lengkap untuk dicatat.
   *
   * Nama penerima WAJIB. Tanpa itu catatan ini hanya memindahkan selisih kas
   * dari "tidak tercatat" menjadi "tercatat tetapi tidak bisa ditelusuri", dan
   * sore hari tetap tidak ada yang bisa menjawab siapa yang membawa uangnya.
   */
  /*
    Galat yang MENGHALANGI terbit, dalam kalimat — pasangan checklist di
    panel Sebelum terbit. Checklist menjawab "apa yang belum", daftar ini
    menjawab "apa yang salah": tanpa keduanya, tombol terbitkan yang mati
    hanya bisa ditebak-tebak sebabnya.
  */
  get galatTerbit(): string[] {
    const galat: string[] = [];

    if (this.totalPayment > this.totalBill) {
      galat.push(
        this.translateService.instant(
          'sales-invoice__create__overpaid-payment',
        ),
      );
    }

    const dor = this.paymentsFormGroup.errors?.['invalidInternalPayment'];
    if (dor) {
      galat.push(dor);
    }

    if (!this.pengembalianLengkap) {
      galat.push(
        this.translateService.instant(
          'sales-invoice__create__rebate-incomplete',
        ),
      );
    }

    if (
      this.t.controls.length > 0 &&
      this.t.controls.some((c) => Number(c.value.quantity) <= 0)
    ) {
      galat.push(
        this.translateService.instant('sales-invoice__create__quantity-zero'),
      );
    }

    /* Diskon menelan seluruh nilai faktur — totalnya jadi negatif. */
    if (this.totalBill < 0) {
      galat.push(
        this.translateService.instant('validation.discount.greaterThanTotal'),
      );
    }

    return galat;
  }

  get pengembalianLengkap(): boolean {
    if (this.perlakuanDiskon !== 'kembali') {
      return true;
    }

    const v = this.rebateFormGroup.value;
    if (
      this.nominalKembali <= 0 ||
      this.nominalKembali > Math.max(this.totalBill, 0) ||
      !v.receiver_name
    ) {
      return false;
    }

    return this.metodeKembali === 'Cash'
      ? true
      : !!v.bank_name && !!v.account_number;
  }

  get subtotal(): number {
    return this.t.value.reduce(
      (a: number, b: any) => a + Number(b.quantity ?? 0) * Number(b.price ?? 0),
      0,
    );
  }

  get diskonItem(): number {
    return this.t.value.reduce(
      (a: number, b: any) =>
        a +
        Number(b.quantity ?? 0) *
          (b.package_code_id ? 0 : Number(b.discount ?? 0)),
      0,
    );
  }

  /* ---------------------------------------------------------------- */
  /* Sebelum terbit                                                    */
  /* ---------------------------------------------------------------- */

  /**
   * Daftar syarat sebelum faktur bisa diterbitkan.
   *
   * FIELD, BUKAN GETTER. Daftar ini dibaca dari *ngFor, dan getter yang
   * mengembalikan larik baru setiap kali dipanggil membuat Angular melihat
   * nilai yang berubah pada setiap pemeriksaan — NG0100 berulang, lalu halaman
   * berhenti tergambar sama sekali. Itu sudah pernah terjadi di aplikasi ini.
   */
  checklist: { kunci: string; selesai: boolean }[] = [];

  private perbaruiChecklist(): void {
    const m = this.metaFormGroup.value;
    const adaItem = this.t.controls.length > 0;
    const jumlahTerisi =
      adaItem && this.t.controls.every((c) => Number(c.value.quantity) > 0);

    this.checklist = [
      {
        kunci: 'sales-invoice__create__check-customer',
        selesai: this.metaFormGroup.controls['customer_id'].valid,
      },
      {
        kunci: 'sales-invoice__create__check-salesman',
        selesai: !!m.sales,
      },
      { kunci: 'sales-invoice__create__check-items', selesai: adaItem },
      { kunci: 'sales-invoice__create__check-quantity', selesai: jumlahTerisi },
      {
        kunci: 'sales-invoice__create__check-payment',
        selesai: this.paymentsFormGroup.valid,
      },
    ];
  }
}
