import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell faktur pembelian — penampung rute anaknya.
 *
 * Faktur pembelian BUKAN dokumen tersendiri: ia catatan penerimaan barang
 * yang kolom fakturnya sudah dilengkapi. Membuatnya dari nol terjadi di
 * formulir penerimaan barang (wajah "dokumen lengkap"); yang tinggal di
 * sini adalah antrean penerimaan yang masih menunggu faktur, formulir
 * pelengkapannya, dan arsipnya.
 */
@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  imports: [RouterOutlet],
})
export class PurchaseInvoiceComponent {}
