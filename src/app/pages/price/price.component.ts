import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-price',
    templateUrl: './price.component.html',
    imports: [FeatureBackgroundComponent, RouterOutlet]
})
export class PriceComponent {

}
