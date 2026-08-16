import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell retur penjualan — kini hanya penampung rute anaknya, mengikuti
 * shell faktur penjualan. Kepala transaksi lama (FeatureBackground +
 * TransactionHeader) sudah tidak dipakai halaman yang didesain ulang.
 */
@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  imports: [RouterOutlet],
})
export class SalesReturnComponent {}
