import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReportInadequateFilterComponent } from './report-inadequate-filter/report-inadequate-filter.component';
import { AlertService } from 'src/app/services/alert.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { debounceTime } from 'rxjs';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-report-inadequate',
    templateUrl: './report-inadequate.component.html',
    styleUrls: ['./report-inadequate.component.css'],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, MatIconButton, MatSuffix, MatIcon, MatPrefix, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DecimalPipe, TranslateModule]
})
export class ReportInadequateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  page: number = 1;
  dataSource: any[] = [];
  dataCount: number = 0;
  isLoading: boolean = false;
  isDownloading: boolean = false;
  search: FormControl = new FormControl('');
  selectedBrands: any[] = [];
  selectedTypes: any[] = [];

  ngOnInit(): void {
    this.fetchData();
    this.search.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.fetchData(1);
    });
  }

  openFilter() {
    this.dynamicComponentService
      .createDynamicComponent(ReportInadequateFilterComponent, {
        brands: this.selectedBrands,
        types: this.selectedTypes,
      })
      .subscribe((data) => {
        if (data != undefined && data != null) {
          this.selectedBrands = data.brands;
          this.selectedTypes = data.types;
          this.fetchData(1);
        }
      });
  }

  fetchData(page: number = this.page) {
    this.page = page;
    this.apiService
      .post('product-stock/inadequate', {
        page: this.page,
        brands: this.selectedBrands.map((x) => x.id),
        types: this.selectedTypes.map((x) => x.id),
        keyword: this.search.value,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  download() {
    this.isDownloading = true;
    this.apiService
      .post('product-stock', {
        mode: 'inadequate',
        brand: this.selectedBrands.map((x) => x.id),
        type: this.selectedTypes.map((x) => x.id),
      })
      .subscribe({
        next: (data: any) => {
          // Create excel file
          const worksheet: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet([]);
          const worksheetData = [
            ['Reference', 'Description', 'Stock', 'Minimum stock', 'Unit'],
          ];

          (data as any[]).forEach((x) => {
            worksheetData.push([
              x.reference,
              x.description,
              x.stock,
              x.minimum_stock,
              x.unit,
            ]);
          });

          xlsx.utils.sheet_add_aoa(worksheet, worksheetData);

          const workbook: xlsx.WorkBook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

          const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, `Inadequate_report_${new Date().getTime()}.xlsx`);
          this.alertService.showSuccess(
            this.translateService.instant(
              'inadequate-report__export__successful'
            )
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.fetchData();
  }
}
