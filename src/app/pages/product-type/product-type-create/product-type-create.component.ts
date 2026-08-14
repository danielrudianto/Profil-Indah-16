import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../../../components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../../../components/dialog-header/dialog-header.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-product-type-create',
    templateUrl: './product-type-create.component.html',
    imports: [DynamicDialogComponent, DialogHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, TranslatePipe]
})
export class ProductTypeCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  @ViewChild('input') input!: ElementRef;
  isOpened: boolean = false;
  isSubmitting: boolean = false;
  typeFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.isOpened = true;
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.focus();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService.post('product-type', this.typeFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(`${data.name} created successfully`);
        this.closeDialog();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  closeDialog(): void {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
