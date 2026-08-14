import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-box-stepper',
    templateUrl: './box-stepper.component.html',
    styleUrls: ['./box-stepper.component.css'],
    standalone: false
})
export class BoxStepperComponent {
  @Input('step') step!: string;
  @Input('valid') valid!: boolean;

  constructor() {}

  ngOnInit(): void {}
}
