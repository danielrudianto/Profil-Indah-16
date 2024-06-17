import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const slideUpDownAnimation = trigger('slideUpDownAnimation', [
  state(
    'in',
    style({
      transform: 'translateY(0)',
      opacity: 1,
    })
  ),
  state(
    'out',
    style({
      transform: 'translateY(100%)',
      opacity: 0,
    })
  ),
  transition('in => out', animate('400ms ease-in-out')),
  transition('out => in', animate('400ms ease-in-out')),
]);
