import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { Component, Inject, Output, EventEmitter, OnInit } from "@angular/core";
import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  FormControlName,
} from "@angular/forms";
import { environment } from "../../../environments/environment";
import { HandlerAppService } from "../../services/handler-app.service";
import { global } from "../../services/global";

interface Login {
  sesion: number;
  viewValue: string;
}

@Component({
  selector: "users-dialog",
  templateUrl: "users.dialog.component.html",
  styleUrls: ["./user.dialog.component.css"],
})
export class UsersDialog {
  // VARIABLES
  view: string = null;
  usuario: any = [];
  title: string = null;
  id: number = null;
  user: any = [];
  ape: any = [];
  permissions: any = null;
  typeStatus: any = [];
  typeMatriz: any = [];
  typeCampaign: any = [];
  typeRol: any = [];
  typeRolAsesor: any = [];
  person: any = [];
  rol: any = [];
  statusLid: any = [];
  // name: any =[];
  touched: any = [];
  // email = new FormControl('', [Validators.required, Validators.email]);
  name = new FormControl("", [Validators.required]);
  surname = new FormControl("", [Validators.required]);
  username = new FormControl("", [Validators.required]);
  status = new FormControl("", [Validators.required]);
  role = new FormControl("", [Validators.required]);
  matrizarp = new FormControl("", [Validators.required]);
  campana = new FormControl("", [Validators.required]);
  // registro a consultar.
  endpoint: string = "/usuario";
  maskDNI = global.maskDNI;
  component = "/admin/users";
  // FORMULARIOS
  formUsuario: FormGroup;
  value = "";
  value2 = "";
  value3 = "";
  act: any = [];
  sesion: number = null;
  log: any = [];
  // sesion: any = [];
  // interface Food {
  //     value: string;
  //     viewValue: string;
  //   }
  login: Login[] = [
    { sesion: 0, viewValue: "OFF" },
    { sesion: 1, viewValue: "ON" },
  ];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // // OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    public dialogRef: MatDialogRef<UsersDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog
  ) {
    this.view = this.data.window;
    this.rol = this.cuser.role;
    this.id = null;
    switch (this.view) {
      case "view":
        this.id = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.id, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.usuario = data.data[0];
              this.act = this.usuario.login;
              if (this.act == "1") {
                this.log = "ON";
              } else if (this.act == "0" || this.act == null) {
                this.log = "OFF";
              }
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
      case "create":
        this.initForms();
        this.title = "Crear Usuario ";
        break;
      case "update":
        this.initForms();
        this.id = this.data.codigo;
        this.sesion = this.data.sesion;
        // this.title = "Editar Usuario" + " " + this.id;
        this.title = "Editar Usuario";
        break;
    }
  }

  initForms() {
    this.getDataInit();
    this.formUsuario = new FormGroup({
      // name = new FormControl('', [Validators.required]);
      name: new FormControl(""),
      surname: new FormControl(""),
      username: new FormControl(""),
      email: new FormControl(""),
      phone: new FormControl(""),
      password: new FormControl(""),
      status: new FormControl("", [Validators.required]),
      lastLogin: new FormControl(""),
      role: new FormControl("", [Validators.required]),
      matrizarp: new FormControl(""),
      id_caex: new FormControl(""),
      campana: new FormControl(""),
      canal: new FormControl(""),
      usu_wolk: new FormControl(""),
      idPersonale: new FormControl(""),
      login: new FormControl(this.sesion),
      us_red: new FormControl(""),
    });
  }

  dateKeys(event) {
    return false;
  }

  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsUpdate",
      id: this.data.codigo,
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          this.typeStatus = data.data["status"];
          this.statusLid = data.data["statusLid"];
          this.typeMatriz = data.data["matriz"];
          this.typeCampaign = data.data["campaign"];
          this.typeRol = data.data["typeRol"];
          this.typeRolAsesor = data.data["typeRolAsesor"];
          this.person = data.data["personale"];
          // console.log(this.person);

          let datos = data.data;
          this.loading.emit(false);

          if (this.view == "update") {
            this.getDataUpdate();
          }
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

  onSubmit() {
    if (this.formUsuario.valid) {
      this.loading.emit(true);
      let body = {
        usuarios: this.formUsuario.value,
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

  getDataUpdate() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSet",
      id: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.user = data.data["getDataUpda"][0].name;
          this.ape = data.data["getDataUpda"][0].surname;

          // this.formUsuario.get('name').setValue(this.usuario.name);
          this.formUsuario
            .get("name")
            .setValue(data.data["getDataUpda"][0].name);
          this.formUsuario
            .get("surname")
            .setValue(data.data["getDataUpda"][0].surname);
          this.formUsuario
            .get("username")
            .setValue(data.data["getDataUpda"][0].username);
          this.formUsuario
            .get("email")
            .setValue(data.data["getDataUpda"][0].email);
          this.formUsuario
            .get("phone")
            .setValue(data.data["getDataUpda"][0].phone);
          this.formUsuario
            .get("role")
            .setValue(data.data["getDataUpda"][0].role);
          this.formUsuario
            .get("status")
            .setValue(data.data["getDataUpda"][0].status);
          this.formUsuario
            .get("lastLogin")
            .setValue(data.data["getDataUpda"][0].lastLogin);
          this.formUsuario
            .get("matrizarp")
            .setValue(data.data["getDataUpda"][0].matrizarp);
          this.formUsuario
            .get("id_caex")
            .setValue(data.data["getDataUpda"][0].id_caex);
          this.formUsuario
            .get("campana")
            .setValue(data.data["getDataUpda"][0].campana);
          this.formUsuario
            .get("canal")
            .setValue(data.data["getDataUpda"][0].canal);
          this.formUsuario
            .get("usu_wolk")
            .setValue(data.data["getDataUpda"][0].usu_wolk);
          this.formUsuario
            .get("idPersonale")
            .setValue(data.data["getDataUpda"][0].idPersonale);
          this.formUsuario
            .get("login")
            .setValue(data.data["getDataUpda"][0].login);
          this.formUsuario
            .get("us_red")
            .setValue(data.data["getDataUpda"][0].us_red);
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
    if (this.formUsuario.valid) {
      let body = {
        usuario: this.formUsuario.value,
      };
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint + "/" + this.id, body, {
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

  closeDialog() {
    this.dialogRef.close();
  }
  newUser: any = [];
  newSurname: any = [];
  exitsPersonal: any = [];
  onSelectionPerson(event) {
    this.exitsPersonal = this.person.find(
      (element) => element.document == event
    );

    if (this.exitsPersonal) {
      const fullName = this.exitsPersonal.name.trim(); //quitar espacios en blanco adicionales
      const nameArray = fullName.split(" "); //dividir la cadena en un arreglo utilizando un espacio como separador

      if (nameArray.length <= 3) {
        const firstName = nameArray[0]; //obtener el primer elemento del arreglo (nombre)
        const lastName = nameArray.slice(1).join(" "); //obtener el resto del arreglo y unirlo con un espacio como separador (apellido)

        this.formUsuario
          .get("idPersonale")
          .setValue(this.exitsPersonal.idPersonale);
        this.formUsuario.get("name").setValue(firstName);
        this.formUsuario.get("surname").setValue(lastName);
      } else if (nameArray.length >= 3) {
        const firstName = nameArray[0] + " " + nameArray[1];
        const lastName = nameArray.slice(2).join(" ");

        this.formUsuario
          .get("idPersonale")
          .setValue(this.exitsPersonal.idPersonale);
        this.formUsuario.get("name").setValue(firstName);
        this.formUsuario.get("surname").setValue(lastName);
      }
    }
  }

  // mayus(e) {
  //     e.value = e.value.toUpperCase();
  // }

  // getErrorMessage() {
  //     if (this.email.hasError('required')) {
  //       return 'Debes ingresar un valor';
  //     }
  //     return this.email.hasError('email') ? 'Not a valid email' : '';
  //   }
  //   get errorState(): boolean {
  //     return this.name.invalid && this.touched;
  //   }
}