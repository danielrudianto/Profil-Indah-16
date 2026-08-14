import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'empty-table',
    templateUrl: './empty-table.component.html',
    styleUrls: ['./empty-table.component.css'],
    imports: [TranslateModule]
})
export class EmptyTableComponent {
}
