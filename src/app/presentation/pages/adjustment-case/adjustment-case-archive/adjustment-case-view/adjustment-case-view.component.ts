import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-adjustment-case-view',
  templateUrl: './adjustment-case-view.component.html',
  styleUrls: ['./adjustment-case-view.component.css'],
})
export class AdjustmentCaseViewComponent {
  constructor(private authService: AuthService) {}

  @Input('data') data: any;
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDeleteConfirmation() {}
}
