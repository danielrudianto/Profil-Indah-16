import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

export interface CustomStepData {
  label: string;
  disabled: boolean;
  selected: boolean;
}

@Component({
    selector: 'app-custom-stepper',
    templateUrl: './custom-stepper.component.html',
    styleUrls: ['./custom-stepper.component.css'],
    imports: [NgFor, NgClass]
})
export class CustomStepperComponent {
  @Input('steps') steps: CustomStepData[] = [];
  @Input('selectedStep') selectedStep: number = 0;
  @Output('onSelectStep') onSelectStep: EventEmitter<number> =
    new EventEmitter<number>();

  onStepSelected(i: number) {
    if (!this.steps[i].disabled) {
      this.onSelectStep.emit(i);
    }
  }
}
