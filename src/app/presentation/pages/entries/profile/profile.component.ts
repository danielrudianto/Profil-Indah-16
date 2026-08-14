import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: false
})
export class ProfileComponent {
  constructor(private authService: AuthService) {}

  name: string = '';

  ngOnInit(): void {
    this.name = this.authService.getUserInfo()?.name ?? '';
  }
}
