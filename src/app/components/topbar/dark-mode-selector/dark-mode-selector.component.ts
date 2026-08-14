import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-dark-mode-selector',
    templateUrl: './dark-mode-selector.component.html',
    styleUrls: ['./dark-mode-selector.component.scss'],
    imports: [MatSlideToggle, MatTooltip, AsyncPipe, TranslatePipe]
})
export class DarkModeSelectorComponent {
  constructor() {} // private darkModeService: DarkModeService

  darkMode$: Observable<boolean> = new Observable();

  toggleDarkMode(): void {
    // this.darkModeService.toggle();
  }
}
