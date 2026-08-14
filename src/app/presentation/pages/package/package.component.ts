import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Package } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../components/feature-header/feature-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-package',
    templateUrl: './package.component.html',
    styleUrls: ['./package.component.css'],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, RouterOutlet, TranslateModule]
})
export class PackageComponent {}
