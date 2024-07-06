import { Component } from '@angular/core';
import { DynamicComponentService } from '../../../../services/dynamic-component.service';
import { ApiService } from '../../../../services/api.service';
import { AlertService } from '../../../../services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { PageEvent } from '@angular/material/paginator';
import { ReportProblematicFilterComponent } from './report-problematic-filter/report-problematic-filter.component';

@Component({
  selector: 'app-report-problematic',
  templateUrl: './report-problematic.component.html',
  styleUrls: ['./report-problematic.component.css'],
})
export class ReportProblematicComponent {
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
      .createDynamicComponent(ReportProblematicFilterComponent, {
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
      .post('product-stock', {
        mode: 'problematic-pagination',
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
        mode: 'problematic',
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
          saveAs(blob, `Problematic_report_${new Date().getTime()}.xlsx`);
          this.alertService.showSuccess(
            this.translateService.instant(
              'problematic-report__export__successful'
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
