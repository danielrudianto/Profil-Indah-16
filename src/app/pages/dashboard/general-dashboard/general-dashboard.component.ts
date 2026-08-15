import { Component } from '@angular/core';
import { StatCard } from 'src/app/models/stat-card.model';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePipe, NgFor } from '@angular/common';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { StatCardComponent } from '../../../components/stat-card/stat-card.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { GcpInfoComponent } from '../../../components/gcp-info/gcp-info.component';

@Component({
    selector: 'app-general-dashboard',
    templateUrl: './general-dashboard.component.html',
    imports: [MatTooltip, RouterLink, MatGridList, NgFor, MatGridTile, StatCardComponent, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, GcpInfoComponent, TranslatePipe]
})
export class GeneralDashboardComponent {
  constructor(
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {}

  stats: StatCard[] = [
    {
      title: "Today's sales",
      value: 0,
      previousValue: 50000,
    },
    {
      title: "This month's sales",
      value: 252879444,
      previousValue: 9785140500,
    },
    {
      title: 'Active promotion',
      value: 0,
    },
    {
      title: 'Current receivable',
      value: 0,
    },
    {
      title: 'Active deposits',
      value: 0,
    },
  ];

  columnNumber: number = 4;
  aspectRatio: string = '4:3';
  isMenuAvailable: boolean = false;
  isLoadingDailyReport: boolean = false;

  ngOnInit(): void {
    this.columnNumber = this.col;
    this.aspectRatio = this.ar;

    window.addEventListener('resize', () => {
      this.columnNumber = this.col;
      this.aspectRatio = this.ar;
    });
  }

  goToStockApplication() {
    // Open new tab opens stock.profilindah.id
    window.open('https://stock.profilindah.id', '_blank');
  }

  openReport(reportType: string) {
    if (reportType == 'sales') {
      this.router.navigate(['/General/Report/Sales']);
    } else if (reportType == 'daily') {
      if (!this.isLoadingDailyReport) {
        this.fetchDailyReport();
      }
    } else if (reportType == 'output') {
      this.router.navigate(['/General/Report/Output']);
    }
  }

  fetchDailyReport() {
    this.isLoadingDailyReport = true;
    this.apiService
      .post('report/daily-sales', {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        type: [1, 8, 39, 40],
        group: 'type',
      })
      .subscribe({
        next: (data: any) => {
          const workbook: xlsx.WorkBook = xlsx.utils.book_new();
          // Reference, description, Unit, brand, type, initial stock, adjustment input, adjustment output, good receipt input, bill output, sales return, final stock
          for (let i = 0; i < data.length; i++) {
            const worksheetData = [
              [
                'Reference',
                'Description',
                'Unit',
                'Brand',
                'Type',
                'Initial Stock',
                'Adjustment Input',
                'Adjustment Output',
                'Good Receipt Input',
                'Bill Output',
                'Sales Return',
                'Final Stock',
              ],
            ];

            const items = data[i].items;

            for (let j = 0; j < items.length; j++) {
              const finalStock =
                Number(items[j].initialStock) +
                Number(items[j].adjustment_input) +
                Number(items[j].adjustment_output) +
                Number(items[j].good_receipt_input) +
                Number(items[j].bill_output) +
                Number(items[j].sales_return);

              worksheetData.push([
                items[j].reference,
                items[j].description,
                items[j].unit,
                items[j].brand,
                items[j].type,
                items[j].initialStock,
                items[j].adjustment_input,
                items[j].adjustment_output,
                items[j].good_receipt_input,
                items[j].bill_output,
                items[j].sales_return,
                finalStock,
              ]);
            }

            const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
            xlsx.utils.book_append_sheet(workbook, worksheet, data[i].name);
          }

          const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, `Daily_report_${new Date().getTime()}.xlsx`);
          this.alertService.showSuccess(
            this.translateService.instant('daily-report__export__successful')
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingDailyReport = false;
      });
  }

  get col(): number {
    if (window.innerWidth > 1440) {
      return 4;
    } else if (window.innerWidth > 1200) {
      return 3;
    } else if (window.innerWidth > 992) {
      return 2;
    } else if (window.innerWidth > 768) {
      return 1;
    } else {
      return 1;
    }
  }

  get ar(): string {
    if (this.col == 1) {
      return '30:9';
    } else if (this.col == 2) {
      return '25:9';
    } else if (this.col == 3) {
      return '19:9';
    } else if (this.col == 4) {
      return '16:9';
    } else {
      return '16:9';
    }
  }
}
