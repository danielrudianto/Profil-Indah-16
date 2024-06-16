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
          this.dataSource = data;
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
    let total = 0;
    this.dataSource.forEach((item) => {
      total += item.bill_payment;
      total += item.deposit_payment;
      total -= item.sales_return_payment;
    });
    return total;
  }
}
