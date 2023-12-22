import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { WebApiService } from "../../../services/web-api.service";
import { HandlerAppService } from "../../../services/handler-app.service";
import { FormGroup, FormControl } from "@angular/forms";

@Component({
  selector: "app-reports-personale",
  templateUrl: "./reports-personale.component.html",
  styleUrls: ["./reports-personale.component.css"],
})
export class ReportsPersonaleComponent implements OnInit {
  ndpoint: string = "/personal";
  formDowPersonale: FormGroup;
  loading_: boolean = false;
  status: any = [];
  job: any = [];
  matrizarp: any = [];
  immediateBoss: any = [];
  rol: any = [];

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  component = "/management/gestion";

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService
  ) {}

  ngOnInit(): void {
    this.dataIni();
    this.formDowPersonale = new FormGroup({
      // fi: new FormControl(''),
      // ff: new FormControl(''),
      jefe_nombre: new FormControl(""),
      status: new FormControl(""),
      idPosition: new FormControl(""),
      role: new FormControl(this.cuser.role),
      iduser: new FormControl(this.cuser.iduser),
    });
  }
  dataIni() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.ndpoint, {
      action: "getParamView",
      role: this.cuser.role,
      matrizarp: this.cuser.matrizarp,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      // matrizarp: this.cuser.matrizarp
    }).subscribe(
      (data) => {
        if (data.success == true) {
          this.rol = this.cuser.role;

          if (!(this.rol == 1)) {

            this.immediateBoss = data.data["immediateBoss"].filter(
              (jefe) =>
                jefe.jefe_id == 2146 ||
                jefe.jefe_id == 1681 ||
                jefe.jefe_id == 2751 ||
                jefe.jefe_id == 2117 ||
                jefe.jefe_id == 2845 ||
                jefe.jefe_id == 2034 ||
                jefe.jefe_id == 2173
            );
          } else {
            this.job = data.data["job"];
            this.matrizarp = data.data["matrizarp"].slice(0, 3);
            this.immediateBoss = data.data["immediateBoss"].filter(
              (result) => result.jefe_id !== null && result.jefe_nombre !== null
            );
          }
          this.status = data.data["status"].slice(0, 2);

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

  descargarArchivos() {
    if (this.formDowPersonale.valid) {
      // if( this.formDowPersonale.value['fi'] <= this.formDowPersonale.value['ff'] && this.formDowPersonale.value['fi'] != '' && this.formDowPersonale.value['ff'] != '' ){

      let body = {
        valest: this.formDowPersonale.value,
      };
      this.loading.emit(true);
      this.handler.showLoadin("Generando Reporte", "Por favor espere...");
      this.WebApiService.getRequest(this.ndpoint, {
        action: "downloadFiles",
        report: "" + JSON.stringify({ body }),
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        role: this.cuser.role,
        modulo: this.component,
        // report:  ""+JSON.stringify({body})
      }).subscribe(
        (data) => {
          if (data.success) {
            const link = document.createElement("a");
            link.href = data.data.url;
            link.download = data.data.file;
            link.click();
            this.handler.showSuccess(data.data.file);
            this.loading.emit(false);
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError(error);
          console.log(error);
          this.loading.emit(false);
        }
      );
      // }else{
      //     this.handler.showError('Periodo de consulta invalido');
      //     this.loading.emit(false);
      // }
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }
}
