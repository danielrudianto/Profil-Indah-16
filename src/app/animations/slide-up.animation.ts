import {
  animate,
  style,
  transition,
  trigger,
  query,
  group,
} from '@angular/animations';

export const slideUpAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ top: '100%' })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-out', style({ top: '-100%' }))], {
        optional: true,
      }),
      query(':enter', [animate('300ms ease-out', style({ top: '0%' }))], {
        optional: true,
      }),
    ]),
  ]),
]);
