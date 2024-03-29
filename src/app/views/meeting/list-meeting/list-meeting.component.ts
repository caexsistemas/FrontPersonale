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
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import Swal from "sweetalert2";
import { MeetingDialog } from "../../../dialogs/meeting/meeting.dialog.component";
import { formatDate } from "@angular/common";

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ReportsMeetingComponent } from "../../../dialogs/reports/meeting/reports-meeting.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { environment } from "../../../../environments/environment";

// Registra el idioma español
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-list-meeting',
  templateUrl: './list-meeting.component.html',
  styleUrls: ['./list-meeting.component.css']
})
export class ListMeetingComponent implements OnInit {
  [x: string]: any;

  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  ValorRol: any = [];
  public detailRoles = [];

  component = "/meeting/list-meeting";
  permissions: any = null;
  contaClick: number = 0;
  endpoint: string = "/meeting";
  contenTable: any = [];
  checkUpdate: boolean;
  // checkUpdate: any = [];
  modal: "successModal";
  endpointup: string = "/noteActupload";
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  personaleData: any = [];
  datapersonale: any = [];
  
  public afuConfig = {
    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    maxSize: "20",
    uploadAPI: {
      url: this.url,
      method: "POST",
      headers: {
        Authorization: this._tools.getToken(),
      },
    },
    theme: "dragNDrop",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    replaceTexts: {
      selectFileBtn: "Seleccione Archivo",
      resetBtn: "Limpiar",
      uploadBtn: "Subir Archivo",
      attachPinBtn: "Sube información usuarios",
      hideProgressBar: false,
      afterUploadMsg_success: "",
      afterUploadMsg_error: "Fallo al momento de cargar el archivo!",
      sizeLimit: "Límite de tamaño",
    },
  };

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet,

  ) {}

  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  @ViewChild("successModal", { static: false })
  public successModal: ModalDirective;

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getMeeting",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      idPersonale: this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.permissions = this.handler.getPermissions(this.component);
          (data.data["getSelectData"][0].perm == 1) ? this.checkUpdate = true : this.checkUpdate = false;
          
          this.generateTable(data.data["getSelectData"]['result']);
          this.contenTable = data.data["getSelectData"]['result'];
          // console.log(this.contenTable);
          

          this.loading = false;
        } else {
          this.loading = false;
          this.ValorRol = [];
          this.handler.handlerError(data);
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
      "view_state",
      "mee_name",
      "meeting_person_id",
      "mee_fec_ini",
      "mee_fec_fin",
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

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }
  showDetails(item) {
    this.detailRoles = item;
    this.infoModal.show();
  }

  ShowDisciplinary() {
    Swal.fire({
      title: "",
      html: `<p class="custom-swal" style="text-align:justify; font-weight: 610;">El presente formulario tiene como fin garantizar que los procesos disciplinarios solicitados por los jefes de las áreas se encuentren adecuadamente soportados, demostrando que se ha realizado un seguimiento adecuado y se cuenta con argumentos para demostrar que un trabajador ha procedido mal respecto a sus obligaciones y responsabilidades. En cualquier caso, es responsabilidad del solicitante la suficiencia y fuerza argumentativa y probatoria frente a la situación a plantear. En este sentido, este formulario solo pretende ser un apoyo en el planteamiento y elaboración de la solicitud.",
      </p>`,
      icon: "success",
    });
  }
  option(action, codigo = null, check) {
    var dialogRef;
    switch (action) {
      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(MeetingDialog, {
          data: {
            window: "view",
            codigo,
            check
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.sendRequest();
          console.log("The dialog was closed");
          console.log(result);
        });
        break;
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(MeetingDialog, {
          data: {
            window: "create",
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
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(MeetingDialog, {
          data: {
            window: "update",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        this.sendRequest();

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
  colorMap = {
    "142/1": "#CA342B",
    "142/2": "#177E31",
    "142/3": "#A79F22",
    "142/4": "#9E253B",
    "Fuera del Grupo": "#9E253B",
  };

  colorState(state) {
    return this.colorMap[state] || "";
  }
  // openc(){
  //   if(this.contaClick == 0){
  //     this.sendRequest();
  //   }
  //   this.contaClick = this.contaClick + 1;
  // }
  // applyFilter(search) {
  //   this.dataSource.filter = search.trim().toLowerCase();
  // }
  formatearFecha(fecha: Date): string {
    let formattedDate = formatDate(fecha, 'MMM d, y', 'es');
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return formattedDate;
  }
  onTriggerSheetClick() {
    this.matBottomSheet.open(ReportsMeetingComponent);
  }
  getAllPersonal() {
    this.WebApiService.getRequest(this.endpoint, {
      action: "getMeeting",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      idPersonale: this.cuser.idPersonale,
    }).subscribe(
      (response) => {
        this.permissions = this.handler.getPermissions(this.component);

        if (response.success) {
          this.handler.showSuccess("El archivo se cargo exitosamente");
          this.personaleData = response.data;
          this.loading = false;
          this.successModal.hide();
          this.sendRequest();
        } else {
          this.datapersonale = [];
          this.handler.handlerError(response);
        }
      },
      (mistake) => {
        let msjErr = "Se presento problema al descargar el archivo";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
}
