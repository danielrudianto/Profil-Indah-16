import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../../services/api.service';
import { AlertService } from '../../../../../services/alert.service';
import moment from 'moment';
import { DateRange, MatDatepickerInputEvent, MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatDateRangePicker } from '@angular/material/datepicker';
import { FeatureBackgroundComponent } from '../../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../../components/feature-header/feature-header.component';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-report-money-dor',
    templateUrl: './report-money-dor.component.html',
    styleUrl: './report-money-dor.component.css',
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, MatFormField, MatLabel, MatDateRangeInput, FormsModule, ReactiveFormsModule, MatStartDate, MatEndDate, MatHint, MatDatepickerToggle, MatSuffix, MatDateRangePicker, NgIf, MatProgressSpinner, NgFor, DecimalPipe, TranslateModule]
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
