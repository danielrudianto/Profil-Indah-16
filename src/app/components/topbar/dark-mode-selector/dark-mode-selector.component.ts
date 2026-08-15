import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsService } from 'src/app/services/settings.service';

/**
 * Sebelumnya komponen ini terpasang di topbar tetapi mati: togglenya diberi
 * [disabled]="true", darkMode$ hanya Observable kosong yang tidak pernah
 * memancarkan apa pun, dan toggleDarkMode() berisi satu baris komentar. Kini
 * keduanya tersambung ke SettingsService.
 *
 * Bentuknya mengikuti Nocturne: satu ikon, bukan slide-toggle Material.
 * Ikonnya menunjukkan TUJUAN, bukan keadaan sekarang — bulan berarti "ganti ke
 * gelap", matahari berarti "ganti ke terang". Menampilkan keadaan sekarang
 * membuat orang menekan ikon yang sudah menggambarkan tampilan di depannya.
 *
 * Keadaannya disimpan sebagai field, bukan dibaca lewat AsyncPipe dua kali.
 * Dua `| async` pada satu Observable berarti dua langganan.
 */
@Component({
  selector: 'app-dark-mode-selector',
  templateUrl: './dark-mode-selector.component.html',
  styleUrls: ['./dark-mode-selector.component.scss'],
  imports: [TranslatePipe],
})
export class DarkModeSelectorComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}

  private destroyRef = inject(DestroyRef);

  gelap = false;

  ngOnInit(): void {
    this.settingsService.mode
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => (this.gelap = mode === 'dark'));
  }

  toggleDarkMode(): void {
    this.settingsService.toggleMode();
  }
}
