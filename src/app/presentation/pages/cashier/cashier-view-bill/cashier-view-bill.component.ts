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
import { ApiService } from '../../../../services/api.service';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-cashier-view-bill',
  templateUrl: './cashier-view-bill.component.html',
  styleUrls: ['./cashier-view-bill.component.css'],
  animations: [panelAnimation],
})
export class CashierViewBillComponent {
  constructor(
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService
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
    service: new FormControl(0, [Validators.required, Validators.min(0)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    delivery: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  panelState: string = 'closed';

  ngOnInit(): void {
    this.formGroup.patchValue({
      id: this.data.data.id,
      name: this.data.data.name,
      createdBy:
        this.data.data.user_draft_bill_code_created_byTouser == null
          ? ''
          : this.data.data.user_draft_bill_code_created_byTouser.name,
      createdAt: this.data.data.created_at,
      note: this.data.data.note,
      otc: this.data.data.otc,
    });

    this.data.data.draft_bill.forEach((x: any) => {
      this.t.push(
        this.formBuilder.group({
          item_id: [x.item_id],
          item_unit_id: [x.item_unit_id],
          reference: [x.item.reference],
          description: [x.item.description],
          price: [x.price],
          unit: [
            x.item.item_unit_id == null
              ? x.item.unit
              : x.item.item_unit_id.unit,
          ],
          discount: [
            x.discount,
            [Validators.min(0), Validators.max(x.price), Validators.required],
          ],
          quantity: [x.quantity],
        })
      );
    });

    this.p.push(
      this.formBuilder.group({
        id: [null],
        name: ['Cash'],
        amount: [0, [Validators.required, Validators.min(0)]],
      })
    );

    this.data.payment_methods.data.forEach((x: any) => {
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
    if (this.panelState == 'enlarged') {
      this.panelState = 'opened';
    } else {
      this.panelState = 'enlarged';
    }
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

  get totalPayment(): number {
    var total = 0;
    this.p.controls.forEach((x: any) => {
      total += Number(x.get('amount')?.value);
    });
    return total;
  }

  get totalValue(): number {
    var total = 0;
    this.t.controls.forEach((x: any) => {
      total +=
        this.getUnitPrice(this.t.controls.indexOf(x)) * x.get('quantity').value;
    });
    return total;
  }

  get grandTotalValue(): number {
    var total = this.totalValue;
    var service = this.f['service'].value;
    var discount = this.f['discount'].value;
    var delivery = this.f['delivery'].value;

    return total + Number(service) + Number(delivery) - Number(discount);
  }

  onSubmit() {
    if (this.grandTotalValue < this.totalPayment) {
      return;
    }

    if (this.grandTotalValue < 0) {
      return;
    }

    this.apiService
      .post('draft-bill/confirm', {
        id: this.f['id'].value,
        payment_methods: this.p.controls
          .filter(
            (x) => x.get('amount')?.value != '' && x.get('amount')?.value > 0
          )
          .map((x) => {
            return {
              payment_method_id: x.get('id')?.value,
              amount: x.get('amount')?.value,
            };
          }),
        service: this.f['service'].value,
        delivery: this.f['delivery'].value,
        discount: this.f['discount'].value,
        items: this.t.controls.map((x) => {
          return {
            item_unit_id:
              this.getFormGroupAt(this.t.controls.indexOf(x)).get(
                'item_unit_id'
              )?.value == null
                ? null
                : Number(
                    this.getFormGroupAt(this.t.controls.indexOf(x)).get(
                      'item_unit_id'
                    )?.value
                  ),

            item_id: Number(
              this.getFormGroupAt(this.t.controls.indexOf(x)).get('item_id')
                ?.value
            ),
            quantity: Number(
              this.getFormGroupAt(this.t.controls.indexOf(x)).get('quantity')
                ?.value
            ),
            discount: Number(
              this.getFormGroupAt(this.t.controls.indexOf(x)).get('discount')
                ?.value
            ),
            price: Number(
              this.getFormGroupAt(this.t.controls.indexOf(x)).get('price')
                ?.value
            ),
          };
        }),
      })
      .subscribe((res: any) => {
        if (res.success) {
          this.onClose();
        }
      });
  }

  onCancel() {
    this.apiService
      .post('draft-bill/delete', {
        id: this.f['id'].value,
      })
      .subscribe({
        next: (data) => {},
        error: (error) => {
          this.alertService.showError(error.error);
        },
      });
  }
}
