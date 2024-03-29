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
// Modal Component
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatafilterModule } from '../../Tools/pipe/datafilter.module';
import { MatInputModule }  from '@angular/material/input';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
//Modulos
import { ProcessaludRoutingModule } from './novedadesalud-routing.module';
import { ProcessaludComponent } from './processalud/processalud.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AbsenteeismComponent } from './absenteeism/absenteeism.component';
import { AngularFileUploaderModule } from "angular-file-uploader";
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

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
    ProcessaludRoutingModule,
    MatBottomSheetModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    AngularFileUploaderModule
  ],
  declarations: [
    ProcessaludComponent,
    AbsenteeismComponent
  ]
})
export class NovedadeSaludModule { }
