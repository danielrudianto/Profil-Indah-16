import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const panelAnimation = trigger('panelAnimation', [
  state('closed', style({ width: '0', opacity: 0 })),
  state('opened', style({ width: '450px', opacity: 1 })),
  state('enlarged', style({ width: '100%', opacity: 1 })),
  transition('* => *', animate('0.3s ease')),
]);
