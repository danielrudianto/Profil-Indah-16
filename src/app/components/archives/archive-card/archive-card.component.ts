import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-archive-card',
    templateUrl: './archive-card.component.html',
    styleUrls: ['./archive-card.component.css']
})
export class ArchiveCardComponent {
  @Input('title') title!: string;
  @Input('count') count!: number;
}
