import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

export interface DialogHeaderStepper {
  label: string;
  selected: boolean;
  disabled: boolean;
}

@Component({
    selector: 'app-dialog-header',
    templateUrl: './dialog-header.component.html',
    styleUrls: ['./dialog-header.component.scss'],
    imports: [MatIconButton, MatIcon]
})
export class DialogHeaderComponent {
  @Input('title') title!: string;
  @Output('onDialogClose') onDialogClose: EventEmitter<void> =
    new EventEmitter<void>();

  closeDialog() {
    this.onDialogClose.emit();
  }
}
