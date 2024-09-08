import { Component, Input } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { AlertService } from '../../../../services/alert.service';
import { DynamicComponentService } from '../../../../services/dynamic-component.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { availableRoles, user } from '../../../../models/user.model';
import { panelAnimation } from '../../../../animations/panel.animation';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  animations: [panelAnimation],
})
export class UserEditComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  @Input('data') data: any;
  panelState: string = 'closed';

  userFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    nik: new FormControl('', [
      Validators.required,
      Validators.minLength(16),
      Validators.maxLength(16),
      Validators.pattern(/^([0-9]{16})$/),
    ]),
    username: new FormControl('', Validators.required),
    password: new FormControl(''),
    role: new FormControl('', Validators.required),
  });

  userResult: user | null = null;
  roles: any[] = availableRoles;
  selectedTypes: any[] = [];

  isSubmitting: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.panelState = 'opened';

    this.apiService.get(`user/${this.data.id}`).subscribe({
      next: (data: any) => {
        this.userFormGroup.patchValue({
          name: data.name,
          nik: data.nik,
          username: data.username,
          role: data.rawRole,
        });

        if (data.rawRole === 6) {
          this.selectedTypes = data.user_sales.map((x: any) => {
            return {
              id: x.item_type.id,
              name: x.item_type.name,
            };
          });
        }
      },
      error: (error) => {
        this.alertService.showError(error.error);
        this.close();
      },
    });

    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        this.close();
        return false;
      }),
      new Hotkey('f', (event: KeyboardEvent): boolean => {
        this.enlarge();
        return false;
      }),
    ]);

    this.userFormGroup.controls['role'].valueChanges.subscribe({
      next: (data) => {
        if (data != 6) {
          this.selectedTypes = [];
        }
      },
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .put('user', {
        id: this.data.id,
        name: this.userFormGroup.controls['name'].value,
        username: this.userFormGroup.controls['username'].value,
        nik: this.userFormGroup.controls['nik'].value,
        is_active: true,
        role: this.userFormGroup.controls['role'].value,
        user_sales: this.selectedTypes.map((x) => {
          return {
            item_type_id: x.id,
          };
        }),
      })
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess(
            this.translateService.instant('user__update-successfully')
          );
          this.close(data);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  enlarge() {
    if (this.panelState == 'opened') {
      this.panelState = 'enlarged';
    } else if (this.panelState == 'enlarged') {
      this.panelState = 'opened';
    }
  }

  close(data: any = undefined) {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }

  onSelectType(event: any) {
    if (this.selectedTypes.filter((x) => x.id == event.id).length == 0) {
      this.selectedTypes.push(event);
    }
  }

  onRemoveType(index: number) {
    this.selectedTypes.splice(index, 1);
  }
}
