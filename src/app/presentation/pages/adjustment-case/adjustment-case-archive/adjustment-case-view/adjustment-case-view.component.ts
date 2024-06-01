import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-adjustment-case-view',
  templateUrl: './adjustment-case-view.component.html',
  styleUrls: ['./adjustment-case-view.component.css'],
})
export class AdjustmentCaseViewComponent {
  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  @Input('data') data: any;
  @Output('close') close: EventEmitter<any> = new EventEmitter();
  isAdministrator: boolean = false;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDeleteConfirmation() {
    const dialog = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        title: 'Are you sure to delete this adjustment case document',
        document: this.data.name,
      },
    });

    dialog.afterClosed().subscribe({
      next: (data) => {
        this.isSubmitting = true;
        this.apiService
          .delete(`adjustment-event/${this.data.id}`)
          .subscribe({
            next: (data: any) => {
              this.alertService.showSuccess(
                `Adjustment case document ${data.name} deleted successfully`
              );
              this.close.emit();
            },
            error: (error) => {
              this.alertService.showError(error);
            },
          })
          .add(() => {
            this.isSubmitting = false;
          });
      },
      error: (error) => {},
    });
  }
}
