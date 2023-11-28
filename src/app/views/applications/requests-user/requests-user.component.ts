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
import { UserServices } from "../../../services/user.service";
import { ApplicationDialog } from "../../../dialogs/application/application.dialog.component";
import { RequestDialog } from "../../../dialogs/request/request.dialog.component";

@Component({
  selector: "app-requests-user",
  templateUrl: "./requests-user.component.html",
  styleUrls: ["./requests-user.component.css"],
})
export class RequestsUserComponent implements OnInit {
  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  ValorRol: any = [];
  public detailRoles = [];

  component = "/applications/request-user";
  permissions: any = null;
  contaClick: number = 0;
  endpoint: string = "/manager";
  contenTable: any = [];

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
      action: "getAplication",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      idPersonale: this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.permissions = this.handler.getPermissions(this.component);
          // this.generateTable(response.data);
          this.generateTable(data.data["getSelectData"]);
          this.contenTable = data.data["getSelectData"];
          // this.ValorRol = data.data
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
      "fec_rad",
      "document",
      "idPersonale",
      "us_role",
      "us_app",
      "us_tip_sol",
      "us_are_tra",
      "updated_at",
      "us_state",
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
  option(action, codigo = null) {
    var dialogRef;
    switch (action) {
      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(RequestDialog, {
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
        dialogRef.afterClosed().subscribe((result) => {
          this.sendRequest();
          console.log("The dialog was closed");
          console.log(result);
        });
        break;
      case "create":
        this.loading = true;
        dialogRef = this.dialog.open(RequestDialog, {
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
        dialogRef = this.dialog.open(RequestDialog, {
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
    "115/1": "#CE9E08",
    "115/2": "#339CFF",
    "115/3": "#FF6202",
    "115/4": "#28C433",
    "115/5": "#CA342B",
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
}
