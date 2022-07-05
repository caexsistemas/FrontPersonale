import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { global } from '../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';
import { DatePipe } from '@angular/common'

export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-technology',
  templateUrl: './technology.dialog.component.html',
  styleUrls: ['./technology.dialog.component.css']
})


export class TechnologyDialog  {

    endpoint:      string = "/technology";
    maskDNI        = global.maskDNI;
    title:         string = null;
    view:          string = null;
    permissions: any = null;
    component = "/technology/technology";
    dataSource: any=[];
    archivo = {
      nombre: null,
      nombreArchivo: null,
      base64textString: null
  }
  dataNovNi: any = []; 
  personalData:     any = [];
  idfeed: number = null;
  feed: any= [];

  //History
  historyMon: any = [];
  check : 0;
  displayedColumns:any  = [];
  checked = false;
  disabled = false;
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<TechnologyDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  )  { 
    this.view = this.data.window;
    this.idfeed = null;
    // this.rol = this.cuser.role;
    // console.log(this.rol);

  
    switch (this.view) {
        case 'create':
            // this.tipInter = this.data.tipoMat;
            // this.tipMatriz = this.data.tipoMat;
            // this.tipRole = this.data.tipRole;
            this.initForms();
            this.title = "Crear Retroalimentacion";
        break;
        case 'update':
          // this.tipInter = this.data.tipoMat;
          // this.tipMatriz = this.data.tipoMat;

          // if( this.rol == 23){
          //   this.retro = true;
          //   }
            this.initForms();
            this.title = "Actualizar Retroalimentacion";
            // this.idfeed = this.data.codigo;

          break;
          case "view":
            // this.idfeed = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(
              this.endpoint + "/" + this.idfeed,
              {}
            ).subscribe(
              (data) => {
                if (data.success == true) {
                 
                  this.feed = data.data['getDataPerson'][0];
                  // this.tipInter = this.feed.matrizarp_cod;
                  // this.tipMatriz = this.feed.matrizarp_cod;

                  this.generateTable(data.data['getDatHistory']);   
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
  initForms(){}
  generateTable(data){
    this.displayedColumns = [
      'currentm_user',
      'date_move',
      'type_move'  
    ];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
  closeDialog() {
    this.dialogRef.close();
  }
  ngOnInit() {
  }

}
