import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../services/api.service';
import { AlertService } from '../../../../../services/alert.service';
import moment from 'moment';
import {
  DateRange,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';

@Component({
    selector: 'app-report-money-dor',
    templateUrl: './report-money-dor.component.html',
    styleUrl: './report-money-dor.component.css',
    standalone: false
})
export class ReportMoneyDorComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  date = new Date();
  firstOfMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  endOfMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);

  formGroup: FormGroup = new FormGroup({
    startDate: new FormControl(this.firstOfMonth, Validators.required),
    endDate: new FormControl(this.endOfMonth, Validators.required),
  });

  isLoading: boolean = false;
  dorDataSource: any;

  ngOnInit(): void {
    this.fetchData();
  }

  onDateRangeChange(event: any): void {
    if (event.value != null) {
      this.fetchData();
    }
    // this.fetchData
  }

  fetchData() {
    this.isLoading = true;
    this.apiService
      .post(`report/money-receipt/dor`, {
        startDate: moment(this.formGroup.value.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.formGroup.value.endDate).format('YYYY-MM-DD'),
      })
      .subscribe({
        next: (data) => {
          this.dorDataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
