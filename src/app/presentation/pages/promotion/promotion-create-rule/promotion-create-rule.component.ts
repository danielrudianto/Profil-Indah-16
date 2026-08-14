import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-promotion-create-rule',
    templateUrl: './promotion-create-rule.component.html',
    styleUrls: ['./promotion-create-rule.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatInput, TranslatePipe]
})
export class PromotionCreateRuleComponent {
  constructor(
    private bottomSheet: MatBottomSheetRef<PromotionCreateRuleComponent>
  ) {}
  
  promotionRuleFormGroup: FormGroup = new FormGroup({
    rule: new FormControl('', [Validators.required]),
    value: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {}

  addPromotionRule() {
    this.bottomSheet.dismiss(this.promotionRuleFormGroup.value);
  }
}
