import {
  Component,
  OnInit,
  Input ,
  ViewChild,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { Tools } from "../../../Tools/tools.page";
import { WebApiService } from "../../../services/web-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { HandlerAppService } from "../../../services/handler-app.service";
import { global } from "../../../services/global";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import {
  MatPaginator,
  MatPaginatorDefaultOptions,
} from "@angular/material/paginator";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { RequisitionDialog } from "../../../dialogs/selection/requisition/requisition.dialog.component";
import { HolidayDialog } from "../../../dialogs/holiday/holiday.dialog.component";
import { empty } from "rxjs";

import { DatePipe } from '@angular/common';
import * as moment from "moment";
import { exit } from "process";
import { AdvanceDialog } from "../../../dialogs/holiday/advance/advance.dialog.component";

@Component({
  selector: "app-advance",
  templateUrl: "./advance.component.html",
  styleUrls: ["./advance.component.css"],
})
export class AdvanceComponent implements OnInit {
  
  contenTable: any = [];
  contenTableVacation: any = [];
  loading: boolean = false;
  endpoint: string = "/advance";
  permissions: any = null;
  displayedColumns: any = [];
  displayedColumnsVacation: any = [];
  displayedColumnsPrueba: any = [];
  dataSource: any = [];
  dataSourceVacation: any = [];
  contaClick: number = 0;
  name: any = [];
  username: any = [];
  // days: number = 0;
  days: any = [];
  totalDays: any = [];
  fec_in: any = [];
  daysTo: any = [];
  daysRe: any = [];
  daysFor: any = [];
  total: number = 0;
  line: any = [];
  // showAge: number = 0;
  showAge: any = [];
  prue: any = [];
  laterFec: any = [];
  content: any = [];
  pipe = new DatePipe('en-US');
  role: any = [];
  stateVac: any = [];
  ini: any = [];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  

  component = "/selfManagement/advance";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet
  ) {}
  

  ngOnInit(): void {
    this.sendRequest();
    this.sendRequestVacation();

    this.permissions = this.handler.permissionsApp;
    
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSelection",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale: this.cuser.idPersonale,
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data.success);
        

          if (data.success == true) {
              this.contenTable = data.data["getSelectData"]["vac"];
              this.fec_in = data.data["getSelectData"]["vac"];
              this.role = this.cuser.role;
           
              this.generateTable(data.data["getSelectData"]["vac"]);
          
          
          this.content = data.data["getSelectData"][0];
          if(this.content){
              this.content.forEach(element => {
                  this.line = element.state;
                  this.laterFec = element.fec_rei;
                  this.stateVac = element.state;
                  this.ini = element.fec_ini;
              });
          }

          // console.log('=>',this.laterFec);

          this.daysFor = data.data["getSelectData"][0];
          // for()
          // this.daysTo = data.data["getSelectData"][0][0].day_vac;

          for (let i = 0; i < this.daysFor.length; i++) {
            // console.log('*', this.daysFor[i].day_vac);

            this.total = this.total + this.daysFor[i].day_vac;

          }
          this.name = this.cuser.idPersonale;
          this.username = this.cuser.username;
          // console.log('=>',this.cuser)
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
      
    );
  }
  generateTable(data) {

    this.displayedColumns = [
      // "view",
      "document",
      "idPersonale",
      "idPosition",
      "admissionDate",
      "daysGained",
      "daysPeople",
      "total_adv",
      "total",
      "remainingDays",
      // "salary",
      // "num_vac",
      // "actions",
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];

    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
          search = document.querySelector(".search-input-table");
          search.value = "";
    }
  }
  calculateDaysAll(fecha){
      var convertAge = new Date(fecha);
      var timeDiff = Math.abs(Date.now() - convertAge.getTime());
          // this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
          this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
      // console.log(this.showAge)
      this.days = (this.showAge * 15); // dias de vacaciones
  }
  calculateDays(fecha){
     var convertAge = new Date(fecha);
     var timeDiff = Math.abs(Date.now() - convertAge.getTime());
    //  console.log(timeDiff)
      // this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
      this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24)); //todos los dias laborados hasta la fecha
  // console.log(this.showAge)
  // console.log((this.showAge*15)/360)
  this.days = ((this.showAge*15)/360); // dias proporcionales de vacaciones
}
  calculateDaysRest(totDays){
    // if(state == '79/2'){
    //   console.log(totDays,"=>", state);
    //   this.totalDays = ( this.days - totDays) 
    // }else{
    //   this.totalDays = 0 ; // Dias restanstes
    // }
    ( totDays)? this.totalDays = ( this.days - totDays):  this.totalDays = 0 ;
  }
  
  option(action, codigo = null, id, create_User) {
    var dialogRef;
    switch (action) {
      case "create":
        // this.laterFec = new Date().toISOString().split("T")[0];
        // if(this.days < 1){
        //  this.handler.showError("No tienes días disponibles");
        //  this.loading = false;
        // break;
        // }
          // if(this.line == '79/1'){
          //   this.handler.showError("Tienes una solicitud pendiente");
          //   this.loading = false;
          // break;
          // }

        this.loading = true;
        dialogRef = this.dialog.open(AdvanceDialog, {
          data: {
            window: "create",
            codigo: this.username,
            id: this.name,
            later:this.laterFec,
            state: this.stateVac,
            ini:this.ini
            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(AdvanceDialog, {
          data: {
            window: "update",
            codigo,
            id: id,

            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;
    }
  }
  sendRequestVacation() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSelection",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale: this.cuser.idPersonale,
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data.success);

        if (data.success == true) {
          this.generateTableVacation(data.data["getSelectData"][0]);
          this.contenTableVacation = data.data["getSelectData"][0];
          // (this.days === 0) ? alert("No tienes dias disponibles"): '';
          // if(this.days == '0'){
          //   this.handler.showError("No tienes dias disponibles");
          // }
          // this.name = this.contenTableVacation;
          // this.username = this.cuser.username;
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
    );
  }
  generateTableVacation(data) {
    this.displayedColumnsVacation = [
      "view",
      "fec_rad",
      "document",
      "idPersonale",
      // "immediateBoss",
      "fec_ini",
      // "day_vac",
      // "day_com",
      "day_adv",
      "fec_rei",
      "state",
      // "num_vac",
      // "actions",
    ];
    this.dataSourceVacation = new MatTableDataSource(data);
    this.dataSourceVacation.sort = this.sort.toArray()[0];
    this.dataSourceVacation.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }

  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
      this.sendRequestVacation();
    }
    this.contaClick = this.contaClick + 1;
  }
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
    this.dataSourceVacation.filter = search.trim().toLowerCase();
  }
  optionVac(action, codigo = null, id, create_User) {
    var dialogRef;
    switch (action) {
      case "create":

        this.loading = true;

        dialogRef = this.dialog.open(AdvanceDialog, {
          data: {
            window: "create",
            codigo: this.username,
            id: this.name,
            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(AdvanceDialog, {
          data: {
            window: "update",
            codigo,
            id: id,

            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;

      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(AdvanceDialog, {
          data: {
            window: "view",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {});
        break;
    }
  }
}
