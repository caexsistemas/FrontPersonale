import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//Complementos
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { SelectModule } from 'ng-select';
//import { NavbarsComponent } from './navbars/navbars.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatMenuModule} from '@angular/material/menu';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

// Modal Component
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatafilterModule } from '../../Tools/pipe/datafilter.module';
import { MatInputModule }  from '@angular/material/input';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
//Modulos
import { NovedadesnominaRoutingModule } from './novedadesnomina-routing.module';
import { IngresoComponent } from './ingreso/ingreso.component';

import { MatCardModule } from '@angular/material/card';
import { TemplateComponent } from '../../template/template.component';
import { CommisionComponent } from './commision/commision.component';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    SelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    BsDropdownModule,
    TabsModule,
    ModalModule,
    DatafilterModule,
    MatInputModule,
    NovedadesnominaRoutingModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatCardModule,
    MatBottomSheetModule
  ],
  declarations: [
    IngresoComponent,
    CommisionComponent
  ],
  entryComponents:[
    TemplateComponent
  ]
})
export class NovedadesnominaModule { }
