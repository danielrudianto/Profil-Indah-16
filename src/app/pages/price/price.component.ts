import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell harga — kini hanya penampung rute anaknya (Sales dan Purchase).
 *
 * Judul dan pencarian dipegang app-list-page di masing-masing halaman anak,
 * sama seperti shell transaksi lainnya.
 */
@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  imports: [RouterOutlet],
})
export class PriceComponent {}
