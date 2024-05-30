import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOutAnimation', [
  state(
    'in',
    style({
      opacity: 1,
    })
  ),
  state(
    'out',
    style({
      opacity: 0,
    })
  ),
  transition('* => *', animate('200ms ease-in-out')),
]);
