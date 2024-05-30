import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

const moment = _rollupMoment || _moment;

export const MONTH_AND_YEAR_FORMAT = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
  ],
})
export class ExpenseReportComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  date = new FormControl(moment());
  isLoading: boolean = true;
  companies: any[] = [];
  types: any[] = [];

  // If selected index is 0, user is viewing report by company
  selectedIndex: number = 0;

  ngOnInit(): void {
    this.fetchReport();
  }

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();

    this.fetchReport();
  }

  fetchReport() {
    const month = this.date.value?.format('MM');
    const year = this.date.value?.format('YYYY');
    this.apiService.get(`report/expense/${month}/${year}`).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.companies = data.companies;
        this.types = data.types;

        for (let i = 0; i < this.types.length; i++) {
          if (this.types[i].children.length != 0) {
            this.types[i].value = this.types[i].children.reduce(
              (a: number, b: any) => a + b.value,
              0
            );
          }
        }
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  toggleSelectedIndex() {
    this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
  }
}
