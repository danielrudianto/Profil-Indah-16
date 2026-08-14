import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-box-stepper',
    templateUrl: './box-stepper.component.html',
    styleUrls: ['./box-stepper.component.scss'],
    imports: [MatIcon]
})
export class BoxStepperComponent {
  @Input('step') step!: string;
  @Input('valid') valid!: boolean;

  constructor() {}

  ngOnInit(): void {}
}
