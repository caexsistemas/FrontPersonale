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
import { LearningDialog } from "../../../dialogs/learning/learning.dialog.component";

// Registra el idioma español
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.css']
})
export class LearningComponent implements OnInit {

  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  ValorRol: any = [];
  public detailRoles = [];

  component = "/meeting/learning";
  permissions: any = null;
  contaClick: number = 0;
  endpoint: string = "/learning";
  contenTable: any = [];
  checkUpdate: boolean;
  // checkUpdate: any = [];

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog
  ) {}

  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
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
          
          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
          // console.log(this.contenTable);
          

          this.loading = false;
        } else {
          this.loading = false;
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
      "lear_name",
      "learting_person_id",
      "lear_fec_eje",
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

  option(action, codigo = null, check) {
    var dialogRef;
    switch (action) {
      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(LearningDialog, {
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
        dialogRef = this.dialog.open(LearningDialog, {
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
        dialogRef = this.dialog.open(LearningDialog, {
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
    "No Disponible": "#9E253B",
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

}
