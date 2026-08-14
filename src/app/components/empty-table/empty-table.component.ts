import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'empty-table',
    templateUrl: './empty-table.component.html',
    imports: [TranslatePipe]
})
export class EmptyTableComponent {
}
