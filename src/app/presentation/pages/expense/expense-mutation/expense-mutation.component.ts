import { Component } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MONTH_AND_YEAR_FORMAT } from '../expense-report/expense-report.component';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ExpenseUpdateComponent } from '../expense-update/expense-update.component';
import { PageEvent } from '@angular/material/paginator';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-expense-mutation',
  templateUrl: './expense-mutation.component.html',
  styleUrls: ['./expense-mutation.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
  ],
})
export class ExpenseMutationComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  date = new FormControl(moment());
  isLoading: boolean = true;
  page: number = 1;
  dataSource: any[] = [];
  dataCount: number = 0;

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

    this.fetchReport(1);
  }

  fetchReport(page: number = this.page) {
    this.isLoading = true;
    this.page = page;
    const month = Number(this.date.value?.format('MM')) - 1;
    const year = this.date.value?.format('YYYY');
    this.apiService
      .get(`expense/${year}/${month}`, {
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  openUpdateExpenseDialog(i: number) {
    const dialog = this.dynamicComponentService.createDynamicComponent(
      ExpenseUpdateComponent,
      {
        id: this.dataSource[i].id,
      }
    );

    dialog.subscribe((data) => {
      if (data != undefined && data != null) {
        if (data == 'deleted') {
          this.dataSource.splice(i, 1);
          this.dataCount = this.dataCount - 1;
        } else {
          const index = this.dataSource.findIndex((x) => x.id == data.id);
          this.dataSource[index].date = data.date;
          this.dataSource[index].description = data.description;
          this.dataSource[index].value = data.value;
          this.dataSource[index].expense_type.name = data.expense_type.name;
          this.dataSource[index].company.name = data.company.name;
        }
      }
    });
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.fetchReport();
  }
}
