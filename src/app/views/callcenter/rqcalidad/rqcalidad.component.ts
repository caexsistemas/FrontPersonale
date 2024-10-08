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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportsRqcalidadComponent } from "../../../dialogs/reports/rqcalidad/reports-rqcalidad.component";
import { RqcalidadvmrpComponent } from "../../../dialogs/reportview/rqcalidadvmrp/rqcalidadvmrp.component";
import { RefuteDialog } from "../../../dialogs/refute/refute.dialog.component";
import { CustomerDialog } from "../../../dialogs/customer/customer.dialog.component";


@Component({
  selector: "app-rqcalidad",
  templateUrl: "./rqcalidad.component.html",
  styleUrls: ["./rqcalidad.component.css"],
})
export class RqcalidadComponent implements OnInit {
  endpoint: string = "/rqcalidad";
  id: number = null;
  permissions: any = null;
  contenTable: any = [];
  dataPdf: any = [];
  loading: boolean = false;
  displayedColumns: any = [];
  dataSource: any = [];
  public detaNovSal = [];
  contaClick: number = 0;
  public mailNotification: any;
  checkRefut:boolean = false
  resRefutacion:boolean = null
  // public isLogged: boolean;

  //Control Permiso
  component = "/callcenter/rqcalidad";
  //History
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // @Output() loading = new EventEmitter();
  // @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;


  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDataCalidad",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component,
      tipMat: this.cuser.matrizarp
    }).subscribe(
      (data) => {
        
        if (data.success == true) {
          this.permissions = this.handler.getPermissions(this.component);
          this.generateTable(data.data["getContData"]);
          (this.cuser.role == '31' || this.cuser.role == '22' || this.cuser.role == '21' ||  this.cuser.role == '2'  ||  this.cuser.role == '1') ? this.checkRefut = true : this.checkRefut = false;
          this.contenTable = data.data["getContData"];

          // si existe la respuesta de refutación
          if(data.data["getContData"][0].resRefutacion){
            this.resRefutacion = true;
          }

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

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "pqid",
      "monitoring_date",
      "status_cal",
      "login",
      "name",
      "supervisor",
      "campana",
      "tipo_gestion",
      "final_note",
      "tpdg_dialog",
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

  //Filtro Tabla
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  //Modales
  showDetails(item) {
    this.detaNovSal = item;
    this.infoModal.show();
  }

  option(action, codigo = null, tipoMat, retro = null, diag = null, staRt = null) {

    var dialogRef;
    switch (action) {
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(RqcalidadDialog, {
          data: {
            window: "create",
            codigo,
            tipoMat: tipoMat,
            dialogo: diag
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
        dialogRef = this.dialog.open(RqcalidadDialog, {
          data: {
            window: "update",
            codigo,
            tipoMat: tipoMat,
            dialogo: diag
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
        dialogRef = this.dialog.open(RqcalidadDialog, {
          data: {
            window: "view",
            codigo,
            dialogo: diag
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {
        });
        break;
        case "repor1vmrq":
          this.loading = true;
          dialogRef = this.dialog.open(RqcalidadvmrpComponent, {
            data: {
              window: "repor1vmrq",
              codigo,
            },
          });
          dialogRef.disableClose = true;
          // LOADING
          dialogRef.componentInstance.loading.subscribe((val) => {
            this.loading = val;
          });
          dialogRef.afterClosed().subscribe((result) => {
          });
          break;
          
          case "updatesub":

            if( ( (staRt == '136/2' || staRt == '136/3') 
            &&  (this.cuser.role == 1 || this.cuser.role == 21 || this.cuser.role == 22)
            ) || ( ( (this.cuser.role == 2 || this.cuser.role == 31) && staRt == '136/3' && retro == '17/0') 
                || ( ( this.cuser.role == 2 || this.cuser.role == 31) && staRt == '136/2')
            )
            ){
            this.loading = true;
            dialogRef = this.dialog.open(RqcalidadDialog, {
              data: {
                window: "updatesub",
                codigo,
                tipoMat: tipoMat,
                dialogo: diag
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
          }else if(staRt == '136/4'){
            this.loading = true;
            dialogRef = this.dialog.open(RqcalidadDialog, {
              data: {
                window: "viewsub",
                codigo,
                tipoMat: tipoMat,
                dialogo: diag
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
          }
          
          break;
          case "refute":
            // this.loading = true;
            dialogRef = this.dialog.open(RefuteDialog, {
              data: {
                window: "refute",
                codigo,
                
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
        case "customer":
          this.loading = true;
          dialogRef = this.dialog.open(CustomerDialog, {
            data: {
              window: "customer",
              codigo,
              tipoMat: tipoMat,
              dialogo: diag
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

  pdf(id) {
          //this.loading.emit(true);
          this.WebApiService.getRequest(this.endpoint, {
            action: "pdf",
            id: id,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
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
            (mistake) => {
              let msjErr = "Error al generar Pdf";
              //let msjErr = mistake.error.message;
              this.handler.showError(msjErr);
              this.loading = false;
            }
    );
  }

  onTriggerSheetClick(){
    this.matBottomSheet.open(ReportsRqcalidadComponent)
  }

  colorMap = {
    "136/0": "#E57300", //NARANJA
    "136/1": "#A4A4A4", //GRIS
    "136/2": "#CBCD15", //AMARILLO
    "136/3": "#E42E15", //ROJO
    "136/4": "#4CBC04"  //VERDE
  };

  colorState(state, retro) {
    //Color Critico 
    if(retro == '17/0' && state == '136/3'){
      state = "136/0";
    }
    return this.colorMap[state] || ""; // Devuelve el color correspondiente o cadena vacía si no coincide
  }

  existeRefutacion(){
    
  }

}
