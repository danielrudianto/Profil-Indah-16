/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { ErrorInterceptor } from './app/interceptors/error.interceptor';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { CustomLoader } from './app/loaders/translate.loader';
import { provideNgxMask, NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { HotkeyModule } from 'angular2-hotkeys';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, MatDividerModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, MatTooltipModule, MatMenuModule, MatGridListModule, MatExpansionModule, MatPaginatorModule, MatProgressSpinnerModule, MatDialogModule, NgxMaskDirective, NgxMaskPipe, MatSelectModule, MatStepperModule, MatAutocompleteModule, MatSnackBarModule, MatNativeDateModule, MatDatepickerModule, MatBottomSheetModule, MatSlideToggleModule, MatChipsModule, MatBadgeModule, MatTabsModule, MatCheckboxModule, MatRadioModule, HotkeyModule.forRoot(), MatRippleModule, DragDropModule),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true,
        },
        /*
          TranslateModule.forRoot() dihapus di @ngx-translate v18 dan digantikan
          penyedia mandiri ini. Pemuat kustomnya tidak berubah — CustomLoader
          tetap membaca /assets/i18n/<lang>.json lewat HttpClient.
        */
        provideTranslateService({
            loader: {
                provide: TranslateLoader,
                useClass: CustomLoader,
                deps: [HttpClient],
            },
        }),
        provideNgxMask(),
        DatePipe,
        DecimalPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideAnimations(),
    ]
})
  .catch(err => console.error(err));
