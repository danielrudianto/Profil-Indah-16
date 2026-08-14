import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class MainComponent {
  constructor(private router: Router) {}

  name: string = 'Daniel Tri';

  get isHidden(): boolean {
    return !['/', '/Administrator'].includes(this.router.url);
  }
}
