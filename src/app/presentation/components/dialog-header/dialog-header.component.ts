import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DialogHeaderStepper {
  label: string;
  selected: boolean;
  disabled: boolean;
}

@Component({
    selector: 'app-dialog-header',
    templateUrl: './dialog-header.component.html',
    styleUrls: ['./dialog-header.component.css'],
    standalone: false
})
export class DialogHeaderComponent {
  @Input('title') title!: string;
  @Output('onDialogClose') onDialogClose: EventEmitter<void> =
    new EventEmitter<void>();

  closeDialog() {
    this.onDialogClose.emit();
  }
}
