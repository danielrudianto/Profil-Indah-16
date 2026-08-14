import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { OverpaymentArchiveViewComponent } from '../overpayment-archive/overpayment-archive-view/overpayment-archive-view.component';

@Component({
    selector: 'app-overpayment-return-list',
    templateUrl: './overpayment-return-list.component.html',
    styleUrl: './overpayment-return-list.component.css',
    standalone: false
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
