import { DatePipe } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
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
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-stock-list-report',
    templateUrl: './stock-list-report.component.html',
    styleUrls: ['./stock-list-report.component.css'],
    animations: [panelAnimation],
    standalone: false
})
export class StockListReportComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private dialog: MatDialogRef<StockListReportComponent>,
    private formBuilder: FormBuilder
  ) {}

  stockFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    viewBy: new FormControl('created', [
      Validators.required,
      Validators.pattern('date|created'),
    ]),
    previous: new FormControl(0, Validators.required),
    mutation: new FormArray([]),
  });

  get f() {
    return this.stockFormGroup.controls;
  }

  get t() {
    return this.f['mutation'] as FormArray;
  }

  isLoading: boolean = true;
  dataSource: any = null;

  async ngOnInit(): Promise<void> {
    await this.fetchMetaData();
    this.fetchByID();
    this.stockFormGroup.controls['date'].valueChanges.subscribe(() => {
      this.fetchByID();
    });

    this.stockFormGroup.controls['viewBy'].valueChanges.subscribe(() => {
      this.fetchByID();
    });
  }

  fetchByID(): void {
    this.isLoading = true;
    this.stockFormGroup.disable({ emitEvent: false });
    this.apiService
      .post('product-stock/mutation', {
        date: this.datePipe.transform(
          this.stockFormGroup.controls['date']?.value,
          'yyyy-MM-dd'
        ),
        viewBy: this.stockFormGroup.controls['viewBy']?.value,
        product_id: this.data.id,
      })
      .subscribe({
        next: (data: any) => {
          this.stockFormGroup.patchValue({
            previous: data.previous ?? 0,
          });

          let stock = data.previous ?? 0;

          this.t.clear();
          data.data.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                date: [x.date],
                created_at: [x.created_at],
                opponent: [this.getOpponentName(x)],
                quantity: [x.quantity],
                document_name: [x.document_name],
                display_quantity: [x.display_quantity],
                stock: [stock + x.quantity, Validators.required],
                unit: [
                  x.product_unit == null
                    ? this.dataSource.unit
                    : x.product_unit.unit,
                ],
                default_unit: [this.dataSource.unit],
              })
            );

            stock += x.quantity;
          });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.close();
        },
      })
      .add(() => {
        this.isLoading = false;
        this.stockFormGroup.enable({ emitEvent: false });
      });
  }

  fetchMetaData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get(`product/${this.data.id}`).subscribe({
        next: (data) => {
          this.dataSource = data;
          resolve(); // Resolve the promise when data is fetched
        },
        error: (error) => {
          this.alertService.showError(error);
          reject(error); // Reject the promise on error
        },
      });
    });
  }

  private getOpponentName(data: any) {
    if (data.good_receipt_code_id) {
      return data.supplier.name;
    }

    if (data.adjustment_case_code_id) {
      return 'INTERNAL';
    }

    if (data.customer != null) {
      return data.customer.name;
    }

    return 'RETAIL';
  }

  close() {
    this.dialog.close();
  }

  get incoming(): number {
    const filtered = this.t.controls.filter((x) => {
      return x.get('quantity')?.value > 0;
    });

    return filtered.length == 0
      ? 0
      : filtered.reduce((a, b) => {
          return a + b.get('quantity')?.value;
        }, 0);
  }

  get outgoing(): number {
    const filtered = this.t.controls.filter((x) => {
      return x.get('quantity')?.value < 0;
    });

    return filtered.length == 0
      ? 0
      : filtered.reduce((a, b) => {
          return a + b.get('quantity')?.value;
        }, 0);
  }

  get finalStock(): number {
    return this.stockFormGroup.value.previous + this.incoming + this.outgoing;
  }
}
