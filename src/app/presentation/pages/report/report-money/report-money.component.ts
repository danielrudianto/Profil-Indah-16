import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-report-money',
  templateUrl: './report-money.component.html',
  styleUrls: ['./report-money.component.css'],
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
}
