import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { OverpaymentArchiveViewComponent } from '../overpayment-archive/overpayment-archive-view/overpayment-archive-view.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-overpayment-return-list',
    templateUrl: './overpayment-return-list.component.html',
    styleUrl: './overpayment-return-list.component.css',
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, DecimalPipe, DatePipe, TranslatePipe]
})
export class OverpaymentReturnListComponent {
  constructor(
    private apiService: ApiService,
    private translateService: TranslateService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  formGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
  });

  dataSource: any[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchByDate();

    this.formGroup.valueChanges.subscribe(() => {
      this.fetchByDate();
    });
  }

  fetchByDate() {
    this.isLoading = true;
    this.apiService
      .post('overpayment/return', {
        date: moment(new Date(this.formGroup.get('date')?.value)).format(
          'YYYY-MM-DD'
        ),
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

  openOverpaymentView(id: number) {
    this.dialog.open(OverpaymentArchiveViewComponent, {
      data: {
        id: id,
      },
    });
  }
}
