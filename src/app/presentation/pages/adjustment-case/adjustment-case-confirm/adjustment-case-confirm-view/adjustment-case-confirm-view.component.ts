import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-adjustment-case-confirm-view',
  templateUrl: './adjustment-case-confirm-view.component.html',
  styleUrls: ['./adjustment-case-confirm-view.component.css'],
  animations: [panelAnimation],
})
export class AdjustmentCaseConfirmViewComponent {
  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  isOpened: boolean = false;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  dataSource: any = null;

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.apiService
      .get(`adjustment-event/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.dataSource = data;
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

  closeDialog(data: any | undefined = undefined) {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }

  deleteAdjustmentCase(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'adjustment-case__confirm__delete__title'
          ),
          document: `[${this.dataSource.name}]`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .post(`adjustment-event/disapprove/${this.data.id}`, {})
            .subscribe({
              next: (data) => {
                this.closeDialog(data);
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }

  confirmAdjustmentCase(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'adjustment-case__confirm__submit__title'
          ),
          document: `[${this.dataSource.name}]`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .post(`adjustment-event/approve/${this.data.id}`, {})
            .subscribe({
              next: (data) => {
                this.closeDialog(data);
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }
}
