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
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ExpenseUpdateComponent } from '../expense-update/expense-update.component';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslateModule } from '@ngx-translate/core';

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
    imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, FormsModule, ReactiveFormsModule, MatHint, MatDatepickerToggle, MatSuffix, MatDatepicker, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DecimalPipe, DatePipe, TranslateModule]
})
export class ExpenseMutationComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog
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
    const month = Number(this.date.value?.format('MM'));
    const year = this.date.value?.format('YYYY');
    this.apiService
      .get(`expense/mutation`, {
        page: this.page,
        month: month,
        year: year,
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
    this.dialog
      .open(ExpenseUpdateComponent, {
        data: {
          id: this.dataSource[i].id,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'deleted') {
          this.dataSource.splice(i, 1);
          this.dataCount--;
          return;
        } else if (data) {
        }
      });

    // dialog.subscribe((data) => {
    //   if (data != undefined && data != null) {
    //     if (data == 'deleted') {
    //       this.dataSource.splice(i, 1);
    //       this.dataCount = this.dataCount - 1;
    //     } else {
    //       const index = this.dataSource.findIndex((x) => x.id == data.id);
    //       this.dataSource[index].date = data.date;
    //       this.dataSource[index].description = data.description;
    //       this.dataSource[index].value = data.value;
    //       this.dataSource[index].expense_type.name = data.expense_type.name;
    //       this.dataSource[index].company.name = data.company.name;
    //     }
    //   }
    // });
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.fetchReport();
  }
}
