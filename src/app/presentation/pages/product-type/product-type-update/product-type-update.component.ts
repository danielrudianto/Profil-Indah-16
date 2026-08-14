import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../../../components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../../../components/dialog-header/dialog-header.component';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-product-type-update',
    templateUrl: './product-type-update.component.html',
    styleUrls: ['./product-type-update.component.css'],
    imports: [DynamicDialogComponent, DialogHeaderComponent, FormsModule, ReactiveFormsModule, NgIf, MatProgressSpinner, MatFormField, MatLabel, MatInput, MatButton, TranslateModule]
})
export class ProductTypeUpdateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  @Input('data') data: any;
  @ViewChild('input') input!: ElementRef;
  isOpened: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  typeFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isOpened = true;
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.focus();
  }

  fetchByID(): void {
    this.apiService
      .get(`product-type/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.typeFormGroup.patchValue(data);
        },
        error: (error) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService.put('product-type', this.typeFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(`${data.name} created successfully`);
        this.closeDialog(data);
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
  closeDialog(data: any = undefined): void {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }
}
