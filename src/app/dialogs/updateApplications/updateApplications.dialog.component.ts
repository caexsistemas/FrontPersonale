import { FormArray, FormBuilder } from "@angular/forms";
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
  selector: "app-updateApplications.dialog",
  templateUrl: "./updateApplications.dialog.component.html",
  styleUrls: ["./updateApplications.dialog.component.css"],
})
export class UpdateApplicationsDialog {
  endpoint: string = "/updApp";
  // endpoint: string = "/rol";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idRol: number = null;

  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  //loading: boolean = false;
  component = "/applications/update_applications";
  // component = "/admin/roles";
  dataSource: any = [];
  RolInfo: any[];
  formLista: FormGroup;

  view_user: any = [];
  formRole: FormGroup;
  formCreate: FormGroup;
  formUpdate: FormGroup;
  formCampos: FormGroup;
  formArray: FormArray;
  PersonaleInfo: any = [];
  exitsPersonal: any = [];
  typeSolit: any = [];
  application: any = [];
  area: any = [];
  position: any = [];
  check_user: boolean = false;
  check_cood: boolean = false;
  rol_user: any = [];
  checkUs: boolean;
  title_us: any = [];
  campos: any = [];
  view_campos: any = [];
  maxForms = 3; // Número máximo de formularios permitidos
  formsCount = 0; // Contador de formularios creados
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
    public dialogRef: MatDialogRef<UpdateApplicationsDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,

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
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idRol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.view_campos = data.data["getCampos"];
              this.view_user = data.data["getCampos"][0];

              this.view_user.us_document && this.view_user.us_idPersonale;
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
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      us_red: new FormControl(""),
      us_app: new FormControl(""),
      us_role: new FormControl(""),
      app_pass: new FormControl(""),
      us_are_tra: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
    this.formCampos = this.fb.group({
      listas: this.fb.array([]),
      new: this.fb.array([]),
    });
    this.formArray = this.fb.array([this.createForm()]);
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
      action: "getParamView",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.RolInfo = data.data["typeRol"];
          this.PersonaleInfo = data.data["getDataPersonale"];
          this.area = data.data["idArea"];
          this.position = data.data["idPosition"];
          this.rol_user = this.cuser.role;
          this.application = data.data["application"];

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
            .get("document")
            .setValue(data.data["getParamUpdate"][0].document);
          this.formCreate
            .get("idPersonale")
            .setValue(data.data["getParamUpdate"][0].idPersonale);
          this.formCreate
            .get("us_role")
            .setValue(data.data["getParamUpdate"][0].us_role);
          this.formCreate
            .get("us_red")
            .setValue(data.data["getParamUpdate"][0].us_red);
          this.formCreate
            .get("us_are_tra")
            .setValue(data.data["getParamUpdate"][0].us_are_tra);

          const tecnoArray = this.formCampos.get("listas") as FormArray;

          data.data["getParamUpdate"].forEach((element) => {
            const tecnoGuia = this.fb.group({
              idapp: new FormControl(element.idapp),
              us_app: new FormControl(element.us_app),
              app_user: new FormControl(element.app_user),
              app_pass: new FormControl(element.app_pass),
            });
            tecnoArray.push(tecnoGuia);
          });
          // const newCampos = this.formCampos.get('new') as FormArray;
          // const formNew = this.fb.group({
          //   us_app: new FormControl(""),
          //   app_user: new FormControl(""),
          //   app_pass: new FormControl(""),
          // })

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

  createForm(): FormGroup {
    return this.fb.group({
      us_app: new FormControl(""),
      app_user: new FormControl(""),
      app_pass: new FormControl(""),
    });
  }
  addForm() {
    this.formArray.push(this.createForm());
    this.formsCount++;
  }
  removeForm(index: number) {
    this.formArray.removeAt(index);
    this.formsCount--;
  }
  onSubmitUpdate() {
    if (this.formCreate.valid) {
      let body = {
        listas: this.formCreate.value,
        campos: this.formCampos.get("listas").value,
        newApp: this.formArray.value,
      };
      console.log("body", body);

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
      this.formCreate.get("us_red_req").setValue(exitsPersonal.us_red);
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
