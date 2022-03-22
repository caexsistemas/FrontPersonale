import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  Component,
  Inject,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import { global } from "../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";

import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";

export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}

@Component({
  selector: "app-role",
  templateUrl: "./role.dialog.component.html",
  styleUrls: ["./role.dialog.component.css"],
})
export class RoleDialog {
  endpoint: string = "/prueba";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idRol: number = null;

  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  //loading: boolean = false;
  component = "/admin/roles";
  dataSource: any = [];

  role: any = [];
  formRole: FormGroup;
  formCreate: FormGroup;
  formUpdate: FormGroup;

  //public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  historyMon: any = [];
  displayedColumns: any = [];

  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<RoleDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog
  ) {
    this.view = this.data.window;
    this.idRol = null;

    switch (this.view) {
      case "create":
        this.initFormsRole();
        this.title = "Crear Nuevo Usuario";
        this.idRol = this.data.codigo;
        break;
      case "update":
        this.initFormsRole();
        this.title = "Actualizar Usuario";
        this.idRol = this.data.codigo;
        break;
      case "view":
        this.idRol = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(
          this.endpoint + "/" + this.idRol,
          {}
        ).subscribe(
          (data) => {
            if (data.success == true) {
              this.role = data.data[0];
              //  console.log('111111  ');
              //console.log(this.role);
              this.loading.emit(false);
            } else {
              this.handler.handlerError(data);
              this.closeDialog();
              this.loading.emit(false);
            }
          },
          (error) => {
            this.handler.showError("Se produjo un error");
            this.loading.emit(false);
          }
        );
        break;
    }
  }
  initForms() {
    this.formRole = new FormGroup({
      idRol: new FormControl(""),
      name: new FormControl(""),
      description: new FormControl(""),
    });
  }
  initFormsRole(){
    this.getDataInit();
    this.formCreate = new FormGroup({
      name: new FormControl(""),
      description: new FormControl("")
    });
  }
  



  closeDialog() {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }
  sendRequest() {}

  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getCreate",
    }).subscribe((data) => {
      if (data.success == true) {
        //DataInfo
        this.idRol = data.data["getCreate"];

       
      }
    });
  }
  optionSubVal(action, codigo=null, titlelist=null){

    var dialogRef;
    switch(action){

        case 'update':
            this.loading.emit(true);
            dialogRef = this.dialog.open(RoleDialog,{
            data: {
                window: 'update',
                codigo
            }
            });
            this.loading.emit(false);
            this.closeDialog();
           
        break;

        case 'view':
            this.loading.emit(true);
            dialogRef = this.dialog.open(RoleDialog,{
            data: {
                window: 'view',
                codigo,
                titlelist
            }
            });
            this.loading.emit(false); 

        break;

        case 'create':
            this.loading.emit(true);
            dialogRef = this.dialog.open(RoleDialog,{
            data: {
                window: 'create',
                codigo,
                titlelist
            }
            });
            this.loading.emit(false);
            this.closeDialog();
        break;

    }
  }
}
