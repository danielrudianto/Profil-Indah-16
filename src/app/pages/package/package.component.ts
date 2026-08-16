import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell paket — kini hanya penampung rute anaknya (daftar, buat, ubah).
 * Judul dan pencarian dipegang app-list-page di halaman anak.
 */
@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  imports: [RouterOutlet],
})
export class PackageComponent {}
