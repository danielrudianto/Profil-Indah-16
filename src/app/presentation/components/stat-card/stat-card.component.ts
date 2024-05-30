import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css'],
})
export class StatCardComponent {
  @Input('title') title!: string;
  @Input('value') value: number = 0;
  @Input('previousValue') previousValue?: number;
  @Input('againstText') againstText?: string;
}
