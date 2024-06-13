import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const sortSVGAnimation = trigger('sortSVGAnimation', [
  state(
    'asc',
    style({
      opacity: 1,
      rotate: '0deg',
    })
  ),
  state(
    'desc',
    style({
      opacity: 1,
      rotate: '180deg',
    })
  ),
  state('none', style({ opacity: 0.1 })),
  transition('* => *', animate('200ms ease-in-out')),
]);
