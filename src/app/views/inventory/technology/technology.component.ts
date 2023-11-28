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
import { MatPaginator } from "@angular/material/paginator";
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { FeedbackDialog } from "../../../dialogs/feedback/feedback.dialog.component";
import { ReportsFeddBackComponent } from "../../../dialogs/reports/feedback/reports-feedback.component";
import { TechnologyDialog } from "../../../dialogs/technology/technology.dialog.component";
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { OwnerDialog } from "../../../dialogs/technology/owner/owner.dialog.component";
@Component({
  selector: "app-technology",
  templateUrl: "./technology.component.html",
  styleUrls: ["./technology.component.css"],
})

export class TechnologyComponent implements OnInit {
  contenTable: any = [];
  loading: boolean = false;
  endpoint: string = "/technology";
  permissions: any = null;
  displayedColumns: any = [];
  dataSource: any = [];
  contaClick: number = 0;
  name: any = [];
  exitsPersonal: any = [];
  area: any = [];
  clickedRows : any = [];
  group:any = [];
  stadValue:     boolean = false;

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/inventory/technology";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getTechnologyAll",
      idUser: this.cuser.iduser,
      // role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale:this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        // console.log(data);
        if (data.success == true) {
          this.generateTable(data.data["getContData"]);
          this.name = data.data['getPersonale'];
         this.exitsPersonal = this.name.find(element => element.idPersonale == this.cuser.idPersonale);
        //  console.log('na=>',this.exitsPersonal.idPosition);

        //  this.area = this.name.find(element => element.idPersonale == this.cuser.idPersonale);


          
          this.contenTable = data.data["getContData"];
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
      'check',
      "view",
      "sub_pla_act_fij",
      "listActivo",
      "listSub",
      "idPersonale",
      "sub_sede",
      "sta_equ",
      // "ser_mod",
      "actions",
    ];
    this.dataSource = new MatTableDataSource(data);
    // this.clickedRows = new Set<this.dataSource>(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }

  option(action, codigo = null, id) {
    var dialogRef;
    switch (action) {
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(TechnologyDialog, {
          data: {
            window: "create",
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
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(TechnologyDialog, {
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
        dialogRef = this.dialog.open(TechnologyDialog, {
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
        case "user":
        this.loading = true;
        dialogRef = this.dialog.open(OwnerDialog, {
          data: {
            window: "user",
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
    }
  }

  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }
  onTriggerSheetClick(event: MouseEvent) {
    // console.log(event.target['id']);    
    this.matBottomSheet.open(ReportsTechnologyComponent);
  }

  // pdf(id) {
  //   this.WebApiService.getRequest(this.endpoint, {
  //     action: "pdf",
  //     id: id,
  //     // cc:document,
  //     // token: this.cuser.token,
  //     idPersonale: this.exitsPersonal.name,
  //     area:this.exitsPersonal.idPosition
  //     // idUser: this.cuser.iduser,
  //     // modulo: this.component,
  //   }).subscribe(
  //     (data) => {
  //       this.permissions = this.handler.getPermissions(this.component);
  //       if (data.success == true) {
  //         const link = document.createElement("a");
  //         link.href = data.data.url;
  //         link.download = data.data.file;
  //         link.target = "_blank";
  //         link.click();
  //         this.handler.showSuccess(data.data.file);
  //         this.loading = false;
  //       } else {
  //         this.handler.handlerError(data);
  //         this.loading = false;
  //       }
  //     },
  //     (error) => {
  //       console.log(error);
  //       this.handler.showError("Se produjo un error");
  //       this.loading = false;
  //     }
  //   );
  // }
  // pdfReposicion(id) {
  //   this.WebApiService.getRequest(this.endpoint, {
  //     action: "pdfReposicion",
  //     id: id,
  //     // token: this.cuser.token,
  //     idPersonale: this.exitsPersonal.name,
  //     area:this.exitsPersonal.idPosition
  //     // idUser: this.cuser.iduser,
  //     // modulo: this.component,
  //   }).subscribe(
  //     (data) => {
  //       this.permissions = this.handler.getPermissions(this.component);
  //       if (data.success == true) {
  //         const link = document.createElement("a");
  //         link.href = data.data.url;
  //         link.download = data.data.file;
  //         link.target = "_blank";
  //         link.click();
  //         this.handler.showSuccess(data.data.file);
  //         this.loading = false;
  //       } else {
  //         this.handler.handlerError(data);
  //         this.loading = false;
  //       }
  //     },
  //     (error) => {
  //       console.log(error);
  //       this.handler.showError("Se produjo un error");
  //       this.loading = false;
  //     }
  //   );
  // }
  onSelectionAct(id, checkbox){
    // this.group = e
    // console.log('tcId=>',Object(this.group ))

      if(checkbox.checked){
       this.group.push(id);
      }else{
       var i = this.group.indexOf( id );
       this.group.splice( i, 1 );
      }
   
       console.log(this.group);
     }
     
     pdfAll(id) {
      if(this.group.length > 0){

      // this.stadValue = true;
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint, {
        action: "pdfAll",
            id:  ""+JSON.stringify(this.group),
            // id: this.group,
        // cc:document,
        token: this.cuser.token,
        idPersonale: this.exitsPersonal.name,
        area:this.exitsPersonal.idPosition,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          this.permissions = this.handler.getPermissions(this.component);
          if (data.success == true) {
            const link = document.createElement("a");
            link.href = data.data.url;
            link.download = data.data.file;
            link.target = "_blank";
            link.click();
            this.handler.showSuccess(data.data.file);
            this.loading = false;
          } else {
            this.handler.handlerError(data);
            this.loading = false;
          }
        },
        (error) => {
          console.log(error);
          this.handler.showError("Se produjo un error al generar Pdf");
          this.loading = false;
        }
      );
    
  }else{
    this.handler.showError('Por favor seleccionar algún registro.');
  }
     }

     pdfReposicion(id) {
      if(this.group.length > 0){
      // this.stadValue = true;
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint, {
        action: "pdfReposicion",
            id:  ""+JSON.stringify(this.group),
            // id: this.group,
        // cc:document,
        token: this.cuser.token,
        idPersonale: this.exitsPersonal.name,
        area:this.exitsPersonal.idPosition,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          this.permissions = this.handler.getPermissions(this.component);
          if (data.success == true) {
            const link = document.createElement("a");
            link.href = data.data.url;
            link.download = data.data.file;
            link.target = "_blank";
            link.click();
            this.handler.showSuccess(data.data.file);
            this.loading = false;
          } else {
            this.handler.handlerError(data);
            this.loading = false;
          }
        },
        (error) => {
          console.log(error);
          this.handler.showError("Se produjo un error al generar Pdf");
          this.loading = false;
        }
      );
    
  }else{
    this.handler.showError('Por favor seleccionar algún registro.');
  }
     }
  

}
