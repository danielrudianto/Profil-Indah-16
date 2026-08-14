import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-gcp-info',
    templateUrl: './gcp-info.component.html',
    styleUrls: ['./gcp-info.component.scss'],
    imports: [MatIcon, TranslatePipe]
})
export class GcpInfoComponent {

}
