import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-expense-create',
    templateUrl: './expense-create.component.html',
    styleUrls: ['./expense-create.component.css'],
    standalone: false
})
export class ExpenseCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;
  metaFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    company_id: new FormControl('', Validators.required),
  });

  expenseFormGroup: FormGroup = new FormGroup({
    expense_type_id: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    value: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  onSelectCompany(data: any) {
    this.metaFormGroup.patchValue({
      company_id: data.id,
    });
  }

  onUnselectCompany() {
    this.metaFormGroup.patchValue({
      company_id: null,
    });
  }

  onSelectExpenseType(data: any) {
    this.expenseFormGroup.patchValue({
      expense_type_id: data.id,
    });
  }

  onUnselectExpenseType() {
    this.expenseFormGroup.patchValue({
      expense_type_id: null,
    });
  }

  ngOnInit(): void {}

  submitForm() {
    this.isSubmitting = true;
    const date = new Date(this.metaFormGroup.controls['date'].value);

    const expense = {
      expense_type_id: this.expenseFormGroup.controls['expense_type_id'].value,
      value: parseFloat(this.expenseFormGroup.controls['value'].value),
      date: this.datePipe.transform(date, 'yyyy-MM-dd'),
      description: this.expenseFormGroup.controls['description'].value,
      company_id: this.metaFormGroup.controls['company_id'].value,
    };

    this.apiService
      .post('expense', expense)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('expense__create__success')
          );
          this.expenseFormGroup.reset();
          this.expenseFormGroup.patchValue({
            date: new Date(),
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}
