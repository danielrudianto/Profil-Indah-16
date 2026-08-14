import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'empty-table',
    templateUrl: './empty-table.component.html',
    styleUrls: ['./empty-table.component.scss'],
    imports: [TranslatePipe]
})
export class EmptyTableComponent {
}
