import {
  Component,
  OnInit,
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

@Component({
  selector: "app-holiday",
  templateUrl: "./holiday.component.html",
  styleUrls: ["./holiday.component.css"],
})
export class HolidayComponent implements OnInit {
  // getTotalCost() {
  //   return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  // }

  contenTable: any = [];
  contenTableVacation: any = [];
  loading: boolean = false;
  endpoint: string = "/holiday";
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
  fec_in: any = [];
  daysTo: any = [];
  daysRe: any = [];
  daysFor: any = [];
  total: number = 0;
  line: any = [];
  // showAge: number = 0;
  showAge: any = [];
  prue: any = [];

  pipe = new DatePipe('en-US');

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/selfManagement/holiday";

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

          this.contenTable.forEach((element) => {
            // console.log( Date('Y-m-d',element.admissionDate) );

            
           
            
            const convertAge = new Date(element.admissionDate);
            const timeDiff = Math.abs(Date.now() - convertAge.getTime());
            this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones
            this.prue = (this.showAge * 15); // dias de vacaciones
            console.log("Dias", this.prue,"años",this.showAge);
            return this.prue;
          });


          this.generateTable(data.data["getSelectData"]["vac"]);
          
          // this.fec_in = this.contenTable[0].admissionDate;
         
          // this.fec_in = this.contenTable.length;
          // for(let i = 0; i < this.contenTable.length; i++){
          //     // console.log('todos',this.fec_in[i].admissionDate);
          //     // this.prue = this.fec_in[i].admissionDate;
          //     console.log('=>',this.contenTable[i].admissionDate)
          //     // if( (this.contenTable[i].admissionDate) ){
          //       const convertAge = new Date(this.contenTable[i].admissionDate );
          //       const timeDiff = Math.abs(Date.now() - convertAge.getTime());
          //       this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365); // años de vacaciones
          //       this.days = ( this.showAge*15); // dias de vacaciones
          //       console.log('===',this.days);
          //   // }
          // }

          // console.log('fech',this.fec_in);
          // console.log('=>',this.cuser.idPersonale);
          this.line = data.data["getSelectData"][0];
          this.daysFor = data.data["getSelectData"][0];
          // for()
          // this.daysTo = data.data["getSelectData"][0][0].day_vac;

          console.log("<<", this.daysFor.length);
          for (let i = 0; i < this.daysFor.length; i++) {
            // console.log('*', this.daysFor[i].day_vac);

            this.total = this.total + this.daysFor[i].day_vac;
          }

          // this.daysFor.forEach(element => {

          //   // console.log('*',element.day_vac);
          //   this.total = element.day_vac;
          //   console.log('*',this.total);

          // });
          // console.log('fec_ini', this.fec_in)
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
      "view",
      "idPersonale",
      "idPosition",
      "admissionDate",
      "daysGained",
      "daysTaken",
      "remainingDays",
      // "salary",
      // "num_vac",
      "actions",
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
  // age= (1-08-2000);
  // showAge;
  // ageCalculator(){
  //   // if(this.fec_in){
  //   //   const convertAge = new Date(this.fec_in);
  //   //   const timeDiff = Math.abs(Date.now() - convertAge.getTime());
  //   //    this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
  //   //    return this.days = ( this.showAge*15)
  //   //   console.log('===',this.showAge)
  //   // }
  //   // for(let i = 0; i < this.contenTable.length; i++){
  //     // console.log('todos',this.fec_in[i].admissionDate);
  //     // this.prue = this.fec_in[i].admissionDate;
  //     // console.log('=>',this.contenTable[i].admissionDate)
  //     // if( (this.contenTable[i].admissionDate) ){
  //       console.log(this.fec_in[0].admissionDate)
  //       // const convertAge = new Date(this.fec_in.admissionDate );
  //       // const timeDiff = Math.abs(Date.now() - convertAge.getTime());
  //       // this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365); // años de vacaciones
  //       // // this.days = ( this.showAge*15); // dias de vacaciones
  //       // console.log('===',this.showAge);
  //   // }
  // // }
  // }
  //     // return this.showAge = 0
  //   }
  // }
  d;
  daysTom() {
    if (this.daysTo) {
      this.d = this.daysTo + this.daysTo;
    }
    return this.d;
  }
  // daysRes(){

  //   if(this.fec_in){
  //     const convertAge = new Date(this.fec_in);
  //     const timeDiff = Math.abs(Date.now() - convertAge.getTime());
  //      this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
  //      this.days = ( this.showAge*15)
  //      this.daysRe = (this.days- this.total);
  //      return this.daysRe;
  //     console.log('===',this.showAge)
  //   }
  // }

  option(action, codigo = null, id, create_User) {
    var dialogRef;
    switch (action) {
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(HolidayDialog, {
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
        });
        break;
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(RequisitionDialog, {
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
        });
        break;

      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(RequisitionDialog, {
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
  sendRequestVacation() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getVacation",
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
          this.generateTableVacation(data.data["getSelectVacation"]);
          this.contenTableVacation = data.data["getSelectVacation"];
          this.name = this.cuser.idPersonale;
          this.username = this.cuser.username;
          console.log("=>", this.cuser);
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
      "document",
      "idPersonale",
      "fec_ini",
      "fec_fin",
      "fec_rei",
      "day_vac",
      // "salary",
      // "num_vac",
      "actions",
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
}