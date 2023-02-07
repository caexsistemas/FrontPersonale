import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { FormArray, FormBuilder, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OnlynumberDirective } from './Tools/onlynumber.directive';

import { ToasterModule, ToasterService} from 'angular2-toaster/angular2-toaster';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ModalModule } from 'ngx-bootstrap/modal';
// import { DataTableModule } from 'angular2-datatable';
// import {MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';
import { DefaultLayoutComponent } from './containers';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import { AppAsideModule,AppBreadcrumbModule,AppHeaderModule,AppFooterModule,AppSidebarModule,} from '@coreui/angular';
import { AppRoutingModule } from './app.routing';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { LoginComponent } from './views/login/login.component';
import { AdministratorComponent } from './views/administrator/administrator.component';
import { NovedadesnominaComponent } from './views/novedadesnomina/novedadesnomina.component';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { NgWizardModule } from 'ng-wizard';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import {MatExpansionModule} from '@angular/material/expansion';

import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
// DIALOG
import { UsersDialog } from './dialogs/users/users.dialog.component';
import { ManagementDialog } from './dialogs/management/management.dialog.component';
import { ListasDialog } from './dialogs/lists/lists.dialog.component';
import { StateDialog } from './dialogs/state/state.dialog.component';
import { IncapacidadesDialog } from './dialogs/incapacidades/incapacidades.dialog.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { IngresoDialog } from './dialogs/ingresonomi/ingreso.dialog.component';
import { NovedadesaludComponent } from './views/novedadesalud/novedadesalud.component';
import { TemplateComponent } from './template/template.component';
import { ProcessaludDialog } from './dialogs/processalud/processalud.dialog.component';
import { ReportProcessaludComponent } from './dialogs/reports/processalud/reports-processalud.component';
import { ReportIncaapacidadesComponent } from './dialogs/reports/incapacidades/reports-incapacidades.component';
import { ReportIncapasinsopComponent } from './dialogs/reports/incapasinsop/reports-incapasinsop.component';
import { ReportIngresoComponent } from './dialogs/reports/ingreso/reports-ingreso.component';
import { CallcenterComponent } from './views/callcenter/callcenter.component';
import { RqcalidadDialog } from './dialogs/rqcalidad/rqcalidad.dialog.component';
import { RoleDialog } from './dialogs/role/role.dialog.component';
import { ReportsRqcalidadComponent } from './dialogs/reports/rqcalidad/reports-rqcalidad.component';
import { FeedbackDialog } from './dialogs/feedback/feedback.dialog.component';
import { ReportsFeddBackComponent } from './dialogs/reports/feedback/reports-feedback.component';
import { InventoryComponent } from "./views/inventory/InventoryComponent";
import { TechnologyDialog } from './dialogs/technology/technology.dialog.component';
import { RqcalidadvmrpComponent } from './dialogs/reportview/rqcalidadvmrp/rqcalidadvmrp.component';
import { AbsenteeismDialog } from './dialogs/absenteeism/absenteeism.dialogs.component';
import { ReportsAbsenteeismComponent } from './dialogs/reports/absenteeism/reports-absenteeism.component';
import { ReportsTechnologyComponent } from './dialogs/reports/technology/reports-technology.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { SelectionComponent } from './views/selection/selection.component';
import { RequisitionDialog } from './dialogs/selection/requisition/requisition.dialog.component';
import { PendingDialog } from './dialogs/selection/pending/pending.dialog.component';
import { VacantDialog } from './dialogs/selection/vacant/vacant.dialog.component';
import { ApprovalDialog } from './dialogs/selection/approval/approval.dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { DeclineDialog } from './dialogs/selection/approval/decline.dialog.component';
import { Pending } from './dialogs/selection/approval/pending';
import { TrainingComponent } from './views/selection/training/training.component';
import { EntryDialog } from './dialogs/selection/vacant/entry/entry.dialog.component';
import { TrainingDialog } from './dialogs/selection/training/training.dialog.component';
import { AssignmentDialog } from './dialogs/selection/assignment/assignment.dialog.component';
import { TrainerDataDialog } from './dialogs/selection/assignment/trainer data/trainer.dialog.component';
import { HiringDialog } from './dialogs/selection/hiring/hiring.dialog.component';
import { InspectionDialog } from './dialogs/selection/training/inspection/inspection.dialog.component';
import { FormationDialog } from './dialogs/selection/training/inspection/formation/formation.dialog.component';
import { OwnerDialog } from './dialogs/technology/owner/owner.dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PreselectedDialog } from './dialogs/selection/hiring/preselected/preselected.dialog.component';
import { SelfManagementComponent } from './views/selfManagement/selfManagement.component';
import { HolidayDialog } from './dialogs/holiday/holiday.dialog.component';
import { AcceptanceDialog } from './dialogs/holiday/acceptance/acceptance.dialog.component';
import { LiquidationDialog } from './dialogs/holiday/liquidation/liquidation.dialog.component';
import { AdvanceDialog } from './dialogs/holiday/advance/advance.dialog.component';
import { CalendarDialog } from './dialogs/calendar/calendar.dialog.component';
import { ReportsManagementComponent } from './dialogs/reports/management/reports-management.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { CertificatesDialog } from './dialogs/certificates/certificates.dialogs.component';

const routes: Routes = []; 
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToasterModule.forRoot(),
    AlertModule.forRoot(),
    // DataTableModule,
    AngularFileUploaderModule,
    NgWizardModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatTableModule,
    ModalModule,
    MatExpansionModule,
    RouterModule.forRoot(routes),
    MatTabsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatNativeDateModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatCardModule,
    MatRadioModule,
    MatSnackBarModule,
    MatBottomSheetModule
    
  ],
  declarations: [
    AppComponent,
    APP_CONTAINERS,
    LoginComponent,
    OnlynumberDirective,
    AdministratorComponent,
    UsersDialog,
    ManagementDialog,
    ListasDialog,
    StateDialog,
    IncapacidadesDialog,
    NovedadesnominaComponent,
    IngresoDialog,
    NovedadesaludComponent,
    TemplateComponent,
    ProcessaludDialog,
    ReportProcessaludComponent,
    ReportIncaapacidadesComponent,
    ReportIncapasinsopComponent,
    ReportIngresoComponent,
    CallcenterComponent,
    RqcalidadDialog,
    RoleDialog,
    ReportsRqcalidadComponent,
    FeedbackDialog,
    ReportsFeddBackComponent,
    RqcalidadvmrpComponent,
    AbsenteeismDialog,   
    InventoryComponent,
    TechnologyDialog,
    ReportsTechnologyComponent,
    SelectionComponent,
    RequisitionDialog,
    PendingDialog,
    VacantDialog,
    ApprovalDialog,
    DeclineDialog,
    Pending,
    ReportsAbsenteeismComponent,
    EntryDialog,
    TrainingDialog,
    AssignmentDialog,
    TrainerDataDialog,    
    ReportsAbsenteeismComponent,
    HiringDialog,
    InspectionDialog,
    FormationDialog,
    OwnerDialog,
    PreselectedDialog,
    SelfManagementComponent,
    HolidayDialog,
    AcceptanceDialog,
    LiquidationDialog,
    AdvanceDialog,
<<<<<<< HEAD
    ReportsManagementComponent,
    CertificatesDialog
=======
    CalendarDialog,
    ReportsManagementComponent
  
>>>>>>> 32fa0af7b943ebe1b38063c31721ffb163735558
  ],
  providers: [{
    
    provide: LocationStrategy,
    useClass: HashLocationStrategy
    
  }],
  exports: [
    RouterModule
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
