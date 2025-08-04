import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-receivable-list',
  templateUrl: './receivable-list.component.html',
  styleUrl: './receivable-list.component.css',
})
export class ReceivableListComponent {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
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
    this.router.navigate([id], {
      relativeTo: this.route,
    });
  }
}
