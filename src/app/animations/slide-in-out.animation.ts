import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const slideInOutAnimation = trigger('slideInOutAnimation', [
  state(
    'in',
    style({
      transform: 'translateX(0)',
      display: 'block',
    })
  ),
  state(
    'out',
    style({
      transform: 'translateX(100%)',
      display: 'none',
    })
  ),
  transition('in => out', animate('400ms ease-in-out')),
  transition('out => in', animate('400ms ease-in-out')),
]);
