import { Component, HostListener } from '@angular/core';
import { KEY_CODE } from '../../../utils/keycode.utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';
import { DynamicComponentService } from '../../../services/dynamic-component.service';
import { CashierViewBillComponent } from './cashier-view-bill/cashier-view-bill.component';

@Component({
    selector: 'app-cashier',
    templateUrl: './cashier.component.html',
    styleUrls: ['./cashier.component.css'],
    standalone: false
})
export class CashierComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  isLoading: boolean = false;
  paymentMethods: any[] = [];
  paymentMethodsLastSynced: Date | undefined = undefined;

  ngOnInit(): void {
    // check if local storage has payment methods
    const paymentMethods = localStorage.getItem('paymentMethods');
    const paymentMethodsLastSynced = localStorage.getItem(
      'paymentMethodsLastSynced'
    );

    if (!paymentMethods || !paymentMethodsLastSynced) {
      this.getPaymentMethods();
    }

    if (paymentMethods && paymentMethodsLastSynced) {
      const syncedDate = new Date(paymentMethodsLastSynced);
      const currentDate = new Date();
      const difference = currentDate.getTime() - syncedDate.getTime();

      // if more than 1 day, sync again
      if (difference > 86400000) {
        this.getPaymentMethods();
      } else {
        this.paymentMethods = JSON.parse(paymentMethods);
      }
    }
  }

  getPaymentMethods() {
    this.apiService.get('cashier/payment-method').subscribe({
      next: (response: any) => {
        this.paymentMethods = response;
        localStorage.setItem('paymentMethods', JSON.stringify(response));
        localStorage.setItem('paymentMethodsLastSynced', new Date().toString());
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  formGroup: FormGroup = new FormGroup({
    otc: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      // only alphanumeric
      Validators.pattern(/^[A-Z0-9]*$/),
    ]),
  });

  onSubmit() {
    this.isLoading = true;
    this.apiService
      .get(`cashier/bill/${this.formGroup.value.otc}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.dynamicComponentService
            .createDynamicComponent(CashierViewBillComponent, {
              data: response,
              payment_methods: this.paymentMethods,
            })
            .subscribe((data) => {
              if (data == 'close') {
                this.formGroup.reset();
              }
            });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
