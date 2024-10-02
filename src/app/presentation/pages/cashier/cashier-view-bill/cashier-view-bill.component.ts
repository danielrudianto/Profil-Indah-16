import { Component, EventEmitter, Input, Output } from '@angular/core';
import { panelAnimation } from '../../../../animations/panel.animation';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DynamicComponentService } from '../../../../services/dynamic-component.service';

@Component({
  selector: 'app-cashier-view-bill',
  templateUrl: './cashier-view-bill.component.html',
  styleUrls: ['./cashier-view-bill.component.css'],
  animations: [panelAnimation],
})
export class CashierViewBillComponent {
  constructor(
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService
  ) {}

  @Input('data') data: any;
  @Output('close') close: EventEmitter<any> = new EventEmitter<any>();

  formGroup: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl(''),
    createdBy: new FormControl(''),
    createdAt: new FormControl(''),
    note: new FormControl(''),
    otc: new FormControl(''),
    items: new FormArray([]),
    paymentMethods: new FormArray([]),
  });

  panelState: string = 'closed';

  ngOnInit(): void {
    this.formGroup.patchValue({
      id: this.data.data.id,
      name: this.data.data.name,
      createdBy: this.data.data.user_draft_bill_code_created_byTouser.name,
      createdAt: this.data.data.createdAt,
      note: this.data.data.note,
      otc: this.data.data.otc,
    });

    this.data.data.draft_bill.forEach((x: any) => {
      this.t.push(
        this.formBuilder.group({
          reference: [x.item.reference],
          description: [x.item.description],
          price: [x.price],
          discount: [
            x.discount,
            [Validators.min(0), Validators.max(x.price), Validators.required],
          ],
          quantity: [x.quantity],
        })
      );
    });

    this.data.paymentMethods.forEach((x: any) => {
      this.p.push(
        this.formBuilder.group({
          id: [x.id],
          name: [x.name],
          amount: [0, [Validators.required, Validators.min(0)]],
        })
      );
    });

    this.panelState = 'enlarged';
  }

  enlarge() {
    this.panelState = 'enlarged';
  }

  onClose() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  get f() {
    return this.formGroup.controls;
  }

  get t() {
    return this.f['items'] as FormArray;
  }

  get p() {
    return this.f['paymentMethods'] as FormArray;
  }

  getFormGroupAt(i: number) {
    return this.t.controls[i] as FormGroup;
  }

  getPaymentFormGroupAt(i: number) {
    return this.p.controls[i] as FormGroup;
  }

  getUnitPrice(i: number): number {
    var value = 0;
    var price = this.getFormGroupAt(i).get('price')?.value;
    var discount = this.getFormGroupAt(i).get('discount')?.value;

    value = Number(price) - Number(discount);
    return value;
  }
}
