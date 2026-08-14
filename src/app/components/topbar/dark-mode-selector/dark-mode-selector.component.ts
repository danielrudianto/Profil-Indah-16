import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsService } from 'src/app/services/settings.service';

/**
 * Sebelumnya komponen ini terpasang di topbar tetapi mati: togglenya diberi
 * [disabled]="true", darkMode$ hanya Observable kosong yang tidak pernah
 * memancarkan apa pun, dan toggleDarkMode() berisi satu baris komentar. Kini
 * keduanya tersambung ke SettingsService.
 */
@Component({
  selector: 'app-dark-mode-selector',
  templateUrl: './dark-mode-selector.component.html',
  imports: [MatSlideToggle, MatTooltip, AsyncPipe, TranslatePipe],
})
export class DarkModeSelectorComponent {
  constructor(private settingsService: SettingsService) {}

  darkMode$: Observable<boolean> = this.settingsService.mode.pipe(
    map((mode) => mode === 'dark')
  );

  toggleDarkMode(): void {
    this.settingsService.toggleMode();
  }
}
