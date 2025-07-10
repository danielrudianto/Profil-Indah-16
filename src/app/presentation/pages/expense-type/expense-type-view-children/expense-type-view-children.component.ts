import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ExpenseTypeCreateComponent } from '../expense-type-create/expense-type-create.component';
import { ExpenseTypeUpdateComponent } from '../expense-type-update/expense-type-update.component';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';

@Component({
  selector: 'app-expense-type-view-children',
  templateUrl: './expense-type-view-children.component.html',
  styleUrls: ['./expense-type-view-children.component.css'],
  animations: [panelAnimation],
})
export class ExpenseTypeViewChildrenComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private _hotKeysService: HotkeysService
  ) {}

  @Input() data!: any;

  panelState: string = 'closed';
  isLoading: boolean = true;
  dataSource: any = null;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.panelState = 'opened';
    this.fetchExpenseChildren();

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
  }

  enlarge() {
    if (this.panelState == 'opened') {
      this.panelState = 'enlarged';
    } else if (this.panelState == 'enlarged') {
      this.panelState = 'opened';
    }
  }

  close() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  fetchExpenseChildren(): void {
    this.apiService
      .get('expense-type/' + this.data.id)
      .subscribe((data: any) => {
        this.dataSource = data;
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  addExpenseType() {
    this.dialog.open(ExpenseTypeCreateComponent, {
      data: {
        parentId: this.data.id,
        parentName: this.data.name,
        parentDescription: this.data.description,
      },
    });
  }

  openUpdateDialog(id: number) {
    this.dialog.open(ExpenseTypeUpdateComponent, {
      data: {
        id: id,
      },
    });
  }
}
