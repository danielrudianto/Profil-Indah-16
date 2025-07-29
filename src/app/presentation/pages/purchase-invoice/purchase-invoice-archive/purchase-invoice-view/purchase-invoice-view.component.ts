import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-purchase-invoice-view',
  templateUrl: './purchase-invoice-view.component.html',
  styleUrls: ['./purchase-invoice-view.component.css'],
})
export class PurchaseInvoiceViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private authService: AuthService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<PurchaseInvoiceViewComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = false;
  dataSource: any;

  step = signal(0);

  goodReceiptFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    invoice_name: new FormControl(''),
    faktur: new FormControl(''),
    date: new FormControl('', Validators.required),
    supplier: new FormControl(''),
    status: new FormControl(''),
    createdBy: new FormControl('', Validators.required),
    createdAt: new FormControl('', Validators.required),
    discount: new FormControl(0, Validators.required),
    good_receipt: new FormArray([]),
  });

  get f() {
    return this.goodReceiptFormGroup.controls;
  }

  get t() {
    return this.f['good_receipt'] as FormArray;
  }

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  openDeleteConfirmation() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'sales-invoice__archive__view__delete__title'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === true) {
          this.apiService.delete(`sales-invoice/${this.data.id}`).subscribe({
            next: () => {
              this.alertService.showSuccess(
                this.translateService.instant('sales-invoice__delete__success')
              );
              this.dialogRef.close();
            },
            error: (error) => {
              this.alertService.showError(error);
            },
          });
        }
      });
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`good-receipt/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          data.good_receipt.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                product_id: [x.product_id],
                product_unit_id: [x.product_unit_id],
                quantity: [x.quantity],
                price: [x.price],
                discount: [x.discount],
                unit: [
                  x.product_unit_id == null
                    ? x.product.unit
                    : x.product_unit.unit,
                ],
                reference: [x.product.reference],
                description: [x.product.description],
              })
            );
          });

          this.goodReceiptFormGroup.patchValue({
            date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
            name: data.name,
            invoice_name: data.invoice_name,
            faktur: data.faktur,
            supplier: data.supplier.name,
            status: data.is_delete
              ? this.translateService.instant(
                  'sales-invoice__archive__view__status__deleted'
                )
              : data.is_confirm
              ? this.translateService.instant(
                  'sales-invoice__archive__view__status__confirmed'
                )
              : this.translateService.instant(
                  'sales-invoice__archive__view__status__pending'
                ),
            createdBy: data.user_good_receipt_code_created_byTouser.name,
            createdAt: this.datePipe.transform(data.created_at, 'dd MMMM YYYY'),
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get subtotal(): number {
    if (this.dataSource == null) return 0;
    return this.dataSource.good_receipt.reduce((a: any, b: any) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }

  getDiscountPercentage(discount: number, price: number) {
    if (price == 0) {
      return '0%';
    } else {
      return `${this.decimalPipe.transform(
        (discount * 100) / price,
        '1.2-2'
      )}%`;
    }
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }

  updatePurchaseInvoice() {
    this.dialogRef.close();
    setTimeout(() => {
      this.router.navigate([
        `/Administrator/Purchase-invoice/Edit/${this.data.id}`,
      ]);
    }, 100);
  }
}
