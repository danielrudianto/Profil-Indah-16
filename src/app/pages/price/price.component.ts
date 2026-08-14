import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-price',
    templateUrl: './price.component.html',
    styleUrls: ['./price.component.css'],
    imports: [FeatureBackgroundComponent, RouterOutlet]
})
export class PriceComponent {

}
