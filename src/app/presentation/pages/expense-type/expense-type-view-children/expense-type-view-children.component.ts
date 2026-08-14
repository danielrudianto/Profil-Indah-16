import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { ApiService } from 'src/app/services/api.service';
import { ExpenseTypeUpdateComponent } from '../expense-type-update/expense-type-update.component';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpenseTypeCreateComponent } from '../expense-type-create/expense-type-create.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemLine } from '@angular/material/list';
import { NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-expense-type-view-children',
    templateUrl: './expense-type-view-children.component.html',
    styleUrls: ['./expense-type-view-children.component.css'],
    animations: [panelAnimation],
    imports: [FormsModule, ReactiveFormsModule, MatIconButton, MatIcon, MatList, NgFor, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemLine, TranslatePipe]
})
export class ExpenseTypeViewChildrenComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { id: number },
    private apiService: ApiService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private sheet: MatBottomSheetRef<ExpenseTypeViewChildrenComponent>
  ) {}

  isLoading: boolean = true;
  isSubmitting: boolean = false;

  expenseTypeFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    children: new FormArray([]),
  });

  get f() {
    return this.expenseTypeFormGroup.controls;
  }

  get t() {
    return this.f['children'] as FormArray;
  }

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID() {
    const id = this.data.id;
    this.apiService.get(`expense-type/${id}`).subscribe({
      next: (data: any) => {
        this.expenseTypeFormGroup.patchValue({
          name: data.name,
          description: data.description,
        });

        data.children.forEach((x: any) => {
          this.t.push(
            this.formBuilder.group({
              id: [x.id],
              name: [x.name],
              description: [x.description],
            })
          );
        });
      },
      error: (error) => {},
    });
  }

  addExpenseType() {
    this.dialog
      .open(ExpenseTypeCreateComponent, {
        data: {
          parentId: this.data.id,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.t.push(
            this.formBuilder.group({
              id: [data.id],
              name: [data.name],
              description: [data.description],
            })
          );
        }
      });
  }

  openUpdateDialog(id: number) {
    this.dialog
      .open(ExpenseTypeUpdateComponent, {
        data: {
          id: id,
          noAction: false,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          if (data == 'deleted') {
            const index = this.t.value.findIndex((x: any) => x.id == id);
            if (index != -1) {
              this.t.removeAt(index);
            }
            return;
          } else {
            const index = this.t.value.findIndex((x: any) => x.id == id);
            if (index != -1) {
              this.t.at(index).patchValue({
                name: data.name,
                description: data.description,
              });
            }
          }
        }
      });
  }

  openUpdateParentDialog() {
    this.dialog
      .open(ExpenseTypeUpdateComponent, {
        data: {
          id: this.data.id,
          noAction: false,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == 'deleted') {
          this.sheet.dismiss('deleted');
          return;
        } else {
          this.expenseTypeFormGroup.patchValue({
            name: data.name,
            description: data.description,
          });
        }
      });
  }
}
