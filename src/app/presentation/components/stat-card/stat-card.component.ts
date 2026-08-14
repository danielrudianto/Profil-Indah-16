import { Component, Input } from '@angular/core';
import { NgIf, NgClass, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ShortNumberPipe } from '../../../pipes/number-format.pipe';

@Component({
    selector: 'app-stat-card',
    templateUrl: './stat-card.component.html',
    styleUrls: ['./stat-card.component.css'],
    imports: [NgIf, NgClass, MatIcon, DecimalPipe, ShortNumberPipe]
})
export class StatCardComponent {
  @Input('title') title!: string;
  @Input('value') value: number = 0;
  @Input('previousValue') previousValue?: number;
  @Input('againstText') againstText?: string;
}
