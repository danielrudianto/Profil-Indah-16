import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './services/settings.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet]
})
export class AppComponent {
  /*
    SettingsService disuntik di sini semata-mata agar terbentuk sejak aplikasi
    dijalankan. Konstruktornya yang memasang mode gelap dan warna aksen dari
    localStorage; tanpa suntikan ini keduanya baru terpasang setelah topbar
    muncul, yaitu setelah login — sehingga halaman login selalu tampil dengan
    tema bawaan meskipun pengguna sudah memilih yang lain.
  */
  constructor(private settingsService: SettingsService) {}

  title = 'Profil Indah Management System V20';

  ngOnInit(): void {
    const lang = localStorage.getItem('lang');

    if (!lang) {
      localStorage.setItem('lang', 'id');
    }
  }
}
