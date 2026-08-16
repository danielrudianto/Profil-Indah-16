import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell promosi — kini hanya penampung rute anaknya. */
@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  imports: [RouterOutlet],
})
export class PromotionComponent {}
