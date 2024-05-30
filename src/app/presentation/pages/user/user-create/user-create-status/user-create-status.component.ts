import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { availableRoles } from 'src/app/models/user.model';
import { AlertService } from 'src/app/services/alert.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-user-create-status',
  templateUrl: './user-create-status.component.html',
  styleUrls: ['./user-create-status.component.css'],
})
export class UserCreateStatusComponent {
  roles: any[] = availableRoles;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {}

  copyUserInfo() {
    this.clipboard.copy(
      `Nama: ${this.data?.name}\r\nUsername: ${this.data?.username}\r\nNIK: ${this.data?.nik}\r\nPassword: ${this.data?.password}`
    );
    this.alertService.showSuccess(
      'Successfully copied user data to clipboard.'
    );
  }
}
