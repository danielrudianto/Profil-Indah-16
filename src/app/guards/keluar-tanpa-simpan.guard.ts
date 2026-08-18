import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/** Formulir yang tahu apakah dirinya boleh ditinggalkan. */
export interface BisaKeluar {
  canExit(): boolean | Observable<boolean>;
}

/**
 * Penjaga keluar-tanpa-simpan.
 *
 * canExit() sudah lama ditulis di formulir-formulir besar, tetapi tidak
 * pernah terpasang di rutenya — kode mati: berpindah halaman dengan isian
 * belum tersimpan tidak pernah benar-benar ditahan. Penjaga ini yang
 * menghidupkannya; formulirnya sendiri yang memutuskan lewat dialog,
 * BUKAN window.confirm — dialog natif tidak bertema dan pada browser
 * tertanam bisa disupresi diam-diam.
 */
export const KeluarTanpaSimpanGuard: CanDeactivateFn<BisaKeluar> = (
  component,
) => (component?.canExit ? component.canExit() : true);
