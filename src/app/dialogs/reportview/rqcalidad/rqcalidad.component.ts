import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../../services/handler-app.service';
import { environment } from '../../../../environments/environment';
import { global } from '../../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-rqcalidad',
  templateUrl: './rqcalidad.component.html',
  styleUrls: ['./rqcalidad.component.css']
})
export class RqcalidadComponent {

  endpoint:      string = '/rqcalidad';
  component      = "/callcenter/rqcalidad";
  maskDNI        = global.maskDNI;
  view:          string = null;
  title:         string = null;
  permissions:   any = null;
  contenTable:   any = [];
  dateStrinMoni: string = null;

  // Informacion Usuario
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(public dialogRef: MatDialogRef<RqcalidadComponent>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog) { 
      
      this.view = this.data.window;

      switch (this.view) {
        case 'repor1':
            let date = new Date();
            this.dateStrinMoni = date.getFullYear()+'-'+String(date.getMonth() + 1).padStart(2, '0');
            this.sendRequest(this.dateStrinMoni+'-01', this.dateStrinMoni+'-31');
            this.title = "PONDERADO";           
        break;
      }
    }



  sendRequest(fechini, fechafin) {

      this.loading.emit(true);
      this.WebApiService.getRequest(this.endpoint, {
        action: "getDateViewInfoGroup",
        idUser: this.cuser.iduser,
        role: this.cuser.role,
        fecini: fechini,
        fecfin: fechafin,
      }).subscribe(
        (data) => {
          this.permissions = this.handler.getPermissions(this.component);
          if (data.success == true) {
            this.generateTable(data.data["getContData"]);
            this.contenTable = data.data["getContData"];
            this.loading.emit(false);
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          console.log(error);
          this.handler.showError("Se produjo un error");
          this.loading.emit(false);
        }
      );
  }

   //Tabla Contenido
   generateTable(data) {}

}
