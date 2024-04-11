/**
 * @description      :
 * @author           : Victor Duran
 * @group            :
 * @created          : 24/06/2021 - 15:20:26
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 24/06/2021
 * - Author          : Victor Duran
 * - Modification    :
 **/

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

import { TextMaskModule } from "angular2-text-mask";
import { SelectModule } from "ng-select";

// Components Routing
import { CallcenterRoutingModule } from "./callcenter-routing.module";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatFormFieldModule } from "@angular/material/form-field";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";

// Modal Component

import { ModalModule } from "ngx-bootstrap/modal";
import { DatafilterModule } from "../../Tools/pipe/datafilter.module";
import { MatInputModule } from "@angular/material/input";
import { NgWizardModule, NgWizardConfig, THEME } from "ng-wizard";
import { RqcalidadComponent } from "./rqcalidad/rqcalidad.component";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { FeedbackComponent } from "./feedback/feedback.component";
import { UnicalldataComponent } from "./unicalldata/unicalldata.component";
import { CustomerComponent } from "./customer/customer.component";
import { DwlcontactComponent } from "./dwlcontact/dwlcontact.component";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { CargueContactComponent } from "./cargue-contact/cargue-contact.component";
//import { ReportsRqcalidadComponent } from "../../dialogs/reports/rqcalidad/ReportsRqcalidadComponent";
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ReportClosingComponent } from "./report-closing/report-closing.component";

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.arrows,
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CallcenterRoutingModule,
    ReactiveFormsModule,
    SelectModule,
    TextMaskModule,
    ModalModule, 
    DatafilterModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    BsDropdownModule,
    TabsModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    BsDropdownModule.forRoot(),
    NgWizardModule.forRoot(ngWizardConfig),
    MatBottomSheetModule,
    MatSelectModule,
    MatDialogModule,
  ],
  declarations: [
    RqcalidadComponent,
    FeedbackComponent,
    UnicalldataComponent,
    CustomerComponent,
    DwlcontactComponent,
    CargueContactComponent,
    ReportClosingComponent
  ],

})
export class CallcenterModule {}
