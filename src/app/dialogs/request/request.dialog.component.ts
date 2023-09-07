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

export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}

@Component({
  selector: "app-request.dialog",
  templateUrl: "./request.dialog.component.html",
  styleUrls: ["./request.dialog.component.css"],
})
export class RequestDialog {
  endpoint: string = "/manager";
  // endpoint: string = "/rol";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idRol: number = null;

  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  //loading: boolean = false;
  component = "/applications/request-user";
  // component = "/admin/roles";
  dataSource: any = [];
  RolInfo: any[];
  formLista: FormGroup;

  view_user: any = [];
  formRole: FormGroup;
  formCreate: FormGroup;
  formUpdate: FormGroup;
  PersonaleInfo: any = [];
  exitsPersonal: any = [];
  typeSolit: any = [];
  application: any = [];
  area: any = [];
  position: any = [];
  check_user: boolean = false;
  check_cood: boolean = false;
  rol_user: any = [];
  state_sol: any = [];
  checkUs: boolean;
  title_us: any = [];

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  historyMon: any = [];
  displayedColumns: any = [];

  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<RequestDialog>,
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
        this.title = "Solicitud de usuarios";
        break;
      case "update":
        this.initFormsRole();
        this.title = "Actualizar Informacion";
        this.idRol = this.data.codigo;

        break;
      case "view":
        this.idRol = this.data.codigo;
        this.title = "Información detallada";
        this.title_us = "Persona para gestion";

        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idRol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.view_user = data.data[0];
              this.view_user.us_document && this.view_user.us_idPersonale
                ? ((this.checkUs = true),
                  (this.title_us = "Nombre y apellidos"))
                : ((this.checkUs = false),
                  (this.title_us = "Persona que solicita gestion"));
              this.generateTable(data.data["getDatHistory"]);
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
  initFormsRole() {
    this.getDataInit();
    this.formCreate = new FormGroup({
      document: new FormControl(this.cuser.username),
      us_document: new FormControl(""),
      idPersonale: new FormControl(this.cuser.idPersonale),
      us_idPersonale: new FormControl(""),
      fec_rad: new FormControl(""),
      us_red: new FormControl(""),
      us_are_tra: new FormControl(""),
      us_position: new FormControl(""),
      us_tip_sol: new FormControl(""),
      us_app: new FormControl(""),
      us_obs: new FormControl(""),
      us_state: new FormControl(""),
      us_role: new FormControl(this.cuser.role),
      create_User: new FormControl(this.cuser.iduser),
    });
  }

  closeDialog() {
    this.reload.emit();
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
      action: "getParamView",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.RolInfo = data.data["getDataRole"];
          this.PersonaleInfo = data.data["getDataPersonale"];
          this.area = data.data["idArea"];
          this.position = data.data["idPosition"];
          this.state_sol = data.data["state"];
          this.rol_user = this.cuser.role;
          // 23,14,21
          if (
            this.rol_user == "23" ||
            this.rol_user == "14" ||
            this.rol_user == "21"
          ) {
            this.typeSolit = data.data["typeSolit"].slice(0, 2);
            this.application = data.data["application"].slice(0, 7);

            this.check_user = true;
            // 31,2, 27
          } else if (
            this.rol_user == "31" ||
            this.rol_user == "2" ||
            this.rol_user == "27" ||
            this.rol_user == "1"
          ) {
            this.typeSolit = data.data["typeSolit"];
            this.application = data.data["application"];

            this.check_cood = true;
          }

          this.exitsPersonal = this.PersonaleInfo.find(
            (element) => element.idPersonale == this.cuser.idPersonale
          );
          this.formCreate.get("us_are_tra").setValue(this.exitsPersonal.idArea);
          this.formCreate
            .get("us_position")
            .setValue(this.exitsPersonal.idPosition);

          if (this.view == "update") {
            this.getDataUpdate();
          }
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  }

  getDataUpdate() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsUpdateSub",
      id: this.idRol,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.formCreate
            .get("us_red")
            .setValue(data.data["getParamUpdate"][0].us_red);
          this.formCreate
            .get("us_are_tra")
            .setValue(data.data["getParamUpdate"][0].us_are_tra);
          this.formCreate
            .get("us_position")
            .setValue(data.data["getParamUpdate"][0].us_position);
          this.formCreate
            .get("us_tip_sol")
            .setValue(data.data["getParamUpdate"][0].us_tip_sol);
          this.formCreate
            .get("us_app")
            .setValue(data.data["getParamUpdate"][0].us_app);
          this.formCreate
            .get("us_obs")
            .setValue(data.data["getParamUpdate"][0].us_obs);
          this.formCreate
            .get("us_document")
            .setValue(data.data["getParamUpdate"][0].us_document);
          this.formCreate
            .get("us_idPersonale")
            .setValue(data.data["getParamUpdate"][0].us_idPersonale);
          this.formCreate
            .get("us_state")
            .setValue(data.data["getParamUpdate"][0].us_state);

          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
          this.closeDialog();
        }
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }

  onSubmitUpdate() {
    if (this.formCreate.valid) {
      let body = {
        listas: this.formCreate.value,
      };
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint + "/" + this.idRol, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      );
    } else {
      this.handler.showError("Complete la información necesaria");
    }
  }

  onSubmit() {
    if (this.formCreate.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.formCreate.value,
      };
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }
  onSelectionChange(event) {
    let exitsPersonal = this.PersonaleInfo.find(
      (element) => element.document == event
    );

    if (exitsPersonal) {
      this.formCreate.get("us_idPersonale").setValue(exitsPersonal.idPersonale);
      // this.formCreate
      //   .get("immediateBoss")
      //   .setValue(exitsPersonal.jef_idPersonale);
      // this.formCreate.get("us_are_tra").setValue(this.exitsPersonal.idPosition);
    }
  }
  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
}
