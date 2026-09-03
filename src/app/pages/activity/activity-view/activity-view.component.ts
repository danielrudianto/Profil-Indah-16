import { Component, Inject } from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivityEntry } from 'src/app/models/activity-entry.model';

/**
 * Detail satu jejak aktivitas — tampilan BACA.
 *
 * Rincian perubahan sengaja TIDAK ditaruh di kolom tabel daftarnya:
 * satu jejak bisa menyentuh belasan kolom dan barisnya jadi tidak
 * terbaca. Daftarnya cukup menyebut siapa-apa-kapan; rinciannya di sini.
 */
@Component({
  selector: 'app-activity-view',
  templateUrl: './activity-view.component.html',
  styleUrls: ['./activity-view.component.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    TranslatePipe,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class ActivityViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public entry: ActivityEntry,
    private dialog: MatDialogRef<ActivityViewComponent>,
  ) {}

  inisial(nama: string | null | undefined): string {
    return (nama ?? 'S').trim().charAt(0).toUpperCase() || 'S';
  }

  kelasTindakan(aksi: string): string {
    if (aksi === 'create') return 'pill--hijau';
    if (aksi === 'delete') return 'pill--merah';
    return 'pill--amber';
  }

  ikonTindakan(aksi: string): string {
    if (aksi === 'create') return 'ph-plus-circle';
    if (aksi === 'delete') return 'ph-x-circle';
    return 'ph-pencil-simple';
  }

  get daftarPerubahan(): { field: string; to: unknown }[] {
    if (!this.entry.changes) return [];
    return Object.entries(this.entry.changes).map(([field, isi]) => ({
      field,
      to: (isi as { to?: unknown })?.to,
    }));
  }

  tutup(): void {
    this.dialog.close();
  }
}
