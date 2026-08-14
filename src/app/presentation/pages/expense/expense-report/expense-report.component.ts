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
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';

const moment = _rollupMoment || _moment;

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
    standalone: false
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
    this.apiService
      .get(`expense`, {
        month: Number(month),
        year: Number(year),
      })
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.companies = data.company;
          this.types = data.expenseTypes;

          // insert to corresponding company and expense type

          for (let i = 0; i < this.companies.length; i++) {
            const value = data.result.filter(
              (x: any) => x.company_id === this.companies[i].id
            );
            this.companies[i].value = value.reduce(
              (a: number, b: any) => a + b.value,
              0
            );
          }

          for (let i = 0; i < this.types.length; i++) {
            for (let j = 0; j < this.types[i].children.length; j++) {
              const value = data.result.filter(
                (x: any) => x.expense_type_id === this.types[i].children[j].id
              );
              this.types[i].children[j].value = value.reduce(
                (a: number, b: any) => a + b.value,
                0
              );
            }

            this.types[i].value = this.types[i].children.reduce(
              (a: number, b: any) => a + b.value,
              0
            );
          }
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });
  }

  onViewByChange(event: any) {
    if (event.value === 'company') {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex = 1;
    }
  }
}
