import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsService } from 'src/app/services/settings.service';
import {
  ACCENT_COLORS,
  ACCENT_DEFAULT,
  AccentColor,
} from 'src/app/constants/accent-color.constant';

/**
 * Pemilih warna aksen di topbar, berdampingan dengan pemilih bahasa dan mode
 * gelap. Pemicunya satu tombol ikon 34px — sama dengan tombol ikon lain di topbar —
 * yang membuka mat-menu berisi keempat belas warna.
 */
@Component({
  selector: 'app-accent-selector',
  templateUrl: './accent-selector.component.html',
  styleUrls: ['./accent-selector.component.scss'],
  imports: [NgFor, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe],
})
export class AccentSelectorComponent {
  constructor(private settingsService: SettingsService) {}

  readonly colors: AccentColor[] = ACCENT_COLORS;

  currentAccent: AccentColor = ACCENT_DEFAULT;

  ngOnInit(): void {
    this.settingsService.accent.subscribe({
      next: (warna) => {
        this.currentAccent = warna;
      },
    });
  }

  changeAccent(warna: AccentColor): void {
    this.settingsService.setAccent(warna);
  }
}
