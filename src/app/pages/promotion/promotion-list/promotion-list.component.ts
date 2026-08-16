import { Component } from '@angular/core';
import { PromotionViewComponent } from '../promotion-view/promotion-view.component';
import { PromotionCreateComponent } from '../promotion-create/promotion-create.component';
import { debounceTime } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { PromotionResultComponent } from '../promotion-result/promotion-result.component';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { FeatureSearchComponent } from '../../../components/feature-search/feature-search.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { TranslatePipe } from '@ngx-translate/core';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { NgIf, NgFor, NgClass, DatePipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-promotion-list',
    templateUrl: './promotion-list.component.html',
    imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
  ]
})
export class PromotionListComponent {
  constructor(
    private router: Router,
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  page: number = 1;
  isLoading: boolean = true;
  dataCount: number = 0;
  dataSource: any[] = [];

  keyword: string = '';

  searchFormGroup: FormGroup = new FormGroup({
    keyword: new FormControl(''),
  });

  ngOnInit(): void {
    this.fetch();

    this.searchFormGroup.valueChanges.pipe(debounceTime(500)).subscribe({
      next: (value) => {
        this.keyword = value;
        this.fetch(1);
      },
    });
  }

  onUpdatePage() {
    this.page = 1;
  }

  onUpdateData(data: any) {
    this.dataCount = data.count;
    this.dataSource = data.data;
  }

  onUpdateLoadingStatus(data: boolean) {
    this.isLoading = data;
  }

  changePage(event: any) {
    const page = event.pageIndex + 1;
    this.page = page;
  }

  onAddButtonPressed() {
    const url = window.location.href;
    this.dynamicComponentService.createDynamicComponent(
      PromotionCreateComponent,
      {}
    );
  }

  fetch(page: number = this.page) {
    this.isLoading = true;
    this.page = page;

    this.apiService
      .get('promotion', {
        keyword: this.keyword,
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;

          this.isLoading = false;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.fetch();
  }

  viewPromotion(index: number) {
    const id = this.dataSource[index].id;
    this.dialog
      .open(PromotionViewComponent, {
        data: {
          id: id,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'result') {
          this.dialog.open(PromotionResultComponent, {
            data: {
              id: id,
            },
          });
        }
      });
  }

  pageSize = 10;

  cari(kata: string) {
    this.keyword = kata;
    this.fetch(1);
  }

  resetPencarian() {
    this.cari('');
  }

  bukaHalaman(halaman: number) {
    this.fetch(halaman);
  }

  lacak = (_: number, item: any): number => item.id;

  inisial(nama: string): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  /**
   * Tiga keadaan 17c, dihitung dari tanggalnya — bukan dari ruas tersimpan.
   * Berjalan: sudah mulai dan belum berakhir. Akan datang: belum mulai.
   * Selesai: tanggal akhirnya lewat.
   */
  private keadaan(item: any): string {
    if (item.is_delete) return 'deleted';
    const kini = new Date();
    if (new Date(item.startDate) > kini) return 'upcoming';
    if (item.endDate != null && new Date(item.endDate) < kini) return 'finished';
    return 'running';
  }

  kunciStatus(item: any): string {
    return 'promotion__status__' + this.keadaan(item);
  }

  kelasStatus(item: any): string {
    const k = this.keadaan(item);
    if (k === 'running') return 'pill--hijau';
    if (k === 'upcoming') return 'pill--amber';
    return 'pill--garis';
  }

  status(data: any) {
    if (data.is_delete) {
      return 'Deleted';
    }

    if (data.endDate == null) {
      return 'Active';
    }

    if (
      data.endDate != null &&
      new Date(data.endDate).getTime() < new Date().getTime()
    ) {
      return 'Expired';
    }

    return 'Active';
  }
}
