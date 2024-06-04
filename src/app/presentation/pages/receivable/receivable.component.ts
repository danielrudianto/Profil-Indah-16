import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-receivable',
  templateUrl: './receivable.component.html',
  styleUrls: ['./receivable.component.css'],
})
export class ReceivableComponent {
  constructor(private apiService: ApiService) {}

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
}
