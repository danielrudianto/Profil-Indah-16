import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [RouterOutlet]
})
export class AppComponent {
  constructor() {}

  title = 'Profil Indah Management System V16';

  ngOnInit(): void {
    const lang = localStorage.getItem('lang');

    if (!lang) {
      localStorage.setItem('lang', 'id');
    }
  }
}
