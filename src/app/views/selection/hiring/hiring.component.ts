import {
  Component,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
  EventEmitter,
  Output,
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
import { HiringDialog } from "../../../dialogs/selection/hiring/hiring.dialog.component";
import { PreselectedDialog } from "../../../dialogs/selection/hiring/preselected/preselected.dialog.component";


@Component({
  selector: 'app-training',
  templateUrl: './hiring.component.html',
  styleUrls: ['./hiring.component.css']
})
export class HiringComponent implements OnInit {

 contenTable: any = [];
  loading: boolean = false;
  endpoint: string = "/hiring";
  permissions: any = null;
  displayedColumns: any = [];
  dataSource: any = [];
  contaClick: number = 0;
  rol: any = [];
  
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  @Output() reload = new EventEmitter();

  component = "/selection/hiring";

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
      action: "getHiring",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,

      // matrizarp: this.cuser.matrizarp,
      // idPersonale:this.cuser.idPersonale

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data);

        if (data.success == true) {

          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
          this.rol = this.cuser.role;

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
      // "idPersonale",
      "state",
      // "actions"
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

  option(action,codigo=null, id,matriz,num,state){
    var dialogRef;
    switch(action){
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(TrainingDialog,{
          data: {
            window: 'create',
            codigo,
            id:id
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
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(HiringDialog,{
          data: {
            window: 'update',
            codigo,
            tipoMat:id,
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
      case "trainer":
        this.loading = true;
        dialogRef = this.dialog.open(HiringDialog, {
          data: {
            window: "trainer",
            codigo,
            id:id,

          },
        });
        dialogRef.disableClose = true;
        this.sendRequest();
      
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
        break;
        case 'cancel':
        this.loading = true;
        dialogRef = this.dialog.open(PreselectedDialog,{
          data: {
            window: 'cancel',
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
  this.matBottomSheet.open(ReportsTechnologyComponent)
}

}
