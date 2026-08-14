import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fadeInOutAnimation } from 'src/app/animations/fade-in-out.animation';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';

@Component({
    selector: 'app-dynamic-dialog',
    templateUrl: './dynamic-dialog.component.html',
    styleUrls: ['./dynamic-dialog.component.css'],
    animations: [slideInOutAnimation, fadeInOutAnimation],
    standalone: false
})
export class DynamicDialogComponent {
  @Input('isOpened') isOpened!: boolean;
  @Output('backgroundClick') backgroundClick: EventEmitter<void> =
    new EventEmitter<void>();

  ngOnInit(): void {}

  onBackgroundClick() {
    this.backgroundClick.emit();
  }
}
