import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dark-mode-selector',
  templateUrl: './dark-mode-selector.component.html',
  styleUrls: ['./dark-mode-selector.component.css'],
})
export class DarkModeSelectorComponent {
  constructor() {} // private darkModeService: DarkModeService

  darkMode$: Observable<boolean> = new Observable();

  toggleDarkMode(): void {
    // this.darkModeService.toggle();
  }
}
