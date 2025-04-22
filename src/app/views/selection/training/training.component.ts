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
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { RequisitionDialog } from "../../../dialogs/selection/requisition/requisition.dialog.component";
import { PendingDialog } from "../../../dialogs/selection/pending/pending.dialog.component";
import { TrainingDialog } from "../../../dialogs/selection/training/training.dialog.component";
import { AssignmentDialog } from "../../../dialogs/selection/assignment/assignment.dialog.component";
import { InspectionDialog } from "../../../dialogs/selection/training/inspection/inspection.dialog.component";
import { StateDialog } from "../../../dialogs/state/state.dialog.component";
import { FormationDialog } from "../../../dialogs/selection/training/inspection/formation/formation.dialog.component";
import { TrainingReportsComponent } from "../../../dialogs/reports/training/training-reports.component";


@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {

 contenTable: any = [];
  loading: boolean = false;
  endpoint: string = "/training";
  permissions: any = null;
  displayedColumns: any = [];
  dataSource: any = [];
  contaClick: number = 0;
  auxTH: any = [];
  
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/selection/training";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }


  ngOnInit():void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;

  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getTraining",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale:this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        // console.log(this.permissions);
        // console.log(data);

        if (data.success == true) {

          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
          this.auxTH = this.cuser.role
         this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (mistake) => {
        let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
  generateTable(data) {
    this.displayedColumns = [
      
      "view",
      "idsel",
      "fec_req",
      "car_sol",
      "matrizarp",
      "idPersonale",
      "num_vac",
      "est_for",
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

  option(action,codigo=null, id,matriz,num,state ){
    var dialogRef;
    switch(action){
      case 'state':
        this.loading = true;
        dialogRef = this.dialog.open(FormationDialog,{
          data: {
            window: 'state',
            codigo,
            id:id,
            // tipoMat: tipoMat
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
      break;
      // case 'update':
      //   this.loading = true;
      //   dialogRef = this.dialog.open(TrainingDialog,{
      //     data: {
      //       window: 'update',
      //       codigo,
      //       id:id
      //       // tipoMat: tipoMat

      //     }
      //   });
      //   dialogRef.disableClose = true;
      //   // LOADING
      //   dialogRef.componentInstance.loading.subscribe(val=>{
      //     this.loading = val;
      //   });
      //   // RELOAD
      //   dialogRef.componentInstance.reload.subscribe(val=>{
      //     this.sendRequest();
      //   });
      //   break;

      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(TrainingDialog,{
          data: {
            window: 'view',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe(result => {
         
        });
      break;
      case "trainer":
        this.loading = true;
        dialogRef = this.dialog.open(TrainingDialog, {
          data: {
            window: "trainer",
            codigo,
            id:id,
            matriz,
            num,
            state,
            auxTH: this.auxTH

            // cargo:this.num_vac
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // dialogRef.afterClosed().subscribe((result) => {
        //   console.log("The dialog was closed");
        //   console.log(result);
        // });
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
        break;
      }
    }
    
openc(){
  if(this.contaClick == 0){
    this.sendRequest();
  }    
  this.contaClick = this.contaClick + 1;
}
applyFilter(search) {
  this.dataSource.filter = search.trim().toLowerCase();
}
onTriggerSheetClick(){
  this.matBottomSheet.open(TrainingReportsComponent)
}

}
