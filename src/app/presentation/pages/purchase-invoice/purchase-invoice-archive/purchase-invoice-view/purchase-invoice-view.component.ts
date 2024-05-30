import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-purchase-invoice-view',
  templateUrl: './purchase-invoice-view.component.html',
  styleUrls: ['./purchase-invoice-view.component.css'],
})
export class PurchaseInvoiceViewComponent {
  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private router: Router
  ) {}

  @Input('data') data: any;
  @Output('close') close: EventEmitter<any> = new EventEmitter();
  isAdministrator: boolean = false;

  ngOnInit(): void {
    console.log(this.data);
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDeleteConfirmation() {
    const dialog = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        title: 'Are you sure to delete this purchase invoice?',
        document: this.data.name,
      },
    });

    dialog.afterClosed().subscribe((data) => {
      if (data == true) {
        this.apiService.delete(`sales-invoice/${this.data.id}`).subscribe({
          next: () => {
            this.alertService.showSuccess(
              `Sales invoice ${this.data.name} deleted successfully`
            );
            this.close.emit();
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        });
      }
    });
  }

  onEdit() {
    this.close.emit();
    setTimeout(() => {
      this.router.navigate([
        `/Administrator/Purchase-invoice/Edit/${this.data.id}`,
      ]);
    }, 300);
  }
}
