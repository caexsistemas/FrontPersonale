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
  selector: 'app-reports-user',
  templateUrl: './reports-user.component.html',
  styleUrls: ['./reports-user.component.css']
})
export class ReportsUserComponent implements OnInit {

  ndpoint: string = "/usuario";
  formDowPersonale: FormGroup;
  loading_: boolean = false;
  status: any = [];
  typeRol: any = [];
  matrizarp: any = [];
  immediateBoss: any = [];
  rol: any = [];

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  component = "/admin/users";


  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService
  ) {}

  ngOnInit(): void {
    this.dataIni();
    this.formDowPersonale = new FormGroup({
      matrizarp: new FormControl(""),
      status: new FormControl(""),
      rol: new FormControl(""),
    });
  }
  dataIni() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.ndpoint, {
      action: "getParamView",
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          this.rol = this.cuser.role;
          this.status = data.data["status"].slice(0, 2);
          this.matrizarp = data.data["matrizarp"].slice(0,3);
          this.typeRol = data.data["typeRol"];


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
