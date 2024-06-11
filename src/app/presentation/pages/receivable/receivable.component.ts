import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReceivableViewComponent } from './receivable-view/receivable-view.component';

@Component({
  selector: 'app-receivable',
  templateUrl: './receivable.component.html',
  styleUrls: ['./receivable.component.css'],
})
export class ReceivableComponent {
  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  dataSource: any[] = [];

  ngOnInit(): void {
    this.fetchReceivable();
  }

  fetchReceivable() {
    this.apiService.get('receivable').subscribe({
      next: (data: any) => {
        this.dataSource = data;
      },
    });
  }

  get max() {
    // get maximum value of datasource.value
    return Math.max(...this.dataSource.map((item) => item.value));
  }

  viewReceivable(id: number) {
    this.dynamicComponentService.createDynamicComponent(
      ReceivableViewComponent,
      {
        id: id,
      }
    );
  }
}
