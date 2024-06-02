import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-promotion-create-rule',
  templateUrl: './promotion-create-rule.component.html',
  styleUrls: ['./promotion-create-rule.component.css'],
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
