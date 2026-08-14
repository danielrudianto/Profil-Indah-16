import { DatePipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import * as XLSX from 'xlsx';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { MatIconButton, MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-report-money',
    templateUrl: './report-money.component.html',
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, MatFormField, MatLabel, MatInput, MatDatepickerInput, FormsModule, ReactiveFormsModule, MatDatepickerToggle, MatSuffix, MatDatepicker, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatIconButton, RouterLink, MatIcon, MatButton, DecimalPipe, TranslatePipe]
})
export class ReportMoneyComponent {
  constructor(
    private apiService: ApiService,
    private datePipe: DatePipe,
    private alertService: AlertService
  ) {}

  dataSource: any[] = [];
  dorDataSource: any = null;
  isLoading: boolean = false;
  isDownloading: boolean = false;
  date: FormControl = new FormControl(new Date(), Validators.required);

  ngOnInit(): void {
    this.fetchMoneyReceipt();

    this.date.valueChanges.subscribe(() => {
      this.fetchMoneyReceipt();
    });
  }

  fetchMoneyReceipt() {
    this.isLoading = true;
    this.apiService
      .post('report/money-receipt', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.filter((x: any) => x.id != 0);
          const dorIndex = data.findIndex((x: any) => x.id == 0);
          if (dorIndex != 0) {
            this.dorDataSource = data[dorIndex];
          }
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  downloadTodayReport() {
    this.isDownloading = true;
    this.apiService
      .post('report/money-receipt/download', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.exportToExcel(data.data);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  get totalPayments(): number {
    const payments =
      this.dataSource.length == 0
        ? 0
        : this.dataSource.reduce((a, b) => {
            return (
              a +
              b.salesInvoice +
              b.salesDeposit -
              b.salesReturn +
              b.overpayment
            );
          }, 0);

    const dorPayments =
      this.dorDataSource.data.length == 0
        ? 0
        : this.dorDataSource.data.reduce((a: any, b: any) => {
            return a + b.salesInvoice + b.salesDeposit;
          }, 0);

    return payments + dorPayments;
  }

  private exportToExcel(
    data: {
      date: Date;
      invoiceName: string;
      customer: string;
      value: number;
      payment: number;
      paymentMethod: string;
    }[]
  ) {
    const excelData = data.map((item, index) => ({
      no: index + 1,
      date: this.formatDateForExcel(new Date(item.date)),
      invoice_name: item.invoiceName,
      Customer: item.customer,
      Value: item.value,
      Payment: item.payment,
      paymentMethod: item.paymentMethod,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // Set number format for Value and Payment columns (columns E and F, 0-indexed)
    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // Column E (Value) - 4th column (0-indexed)
        const valueCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })];
        if (valueCell) {
          valueCell.z = '#,##0.00';
        }

        // Column F (Payment) - 5th column (0-indexed)
        const paymentCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })];
        if (paymentCell) {
          paymentCell.z = '#,##0.00';
        }
      }
    }

    // Rest of the function remains the same...
    const columnWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'Penerimaan uang.xlsx');
  }

  private formatDateForExcel(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
