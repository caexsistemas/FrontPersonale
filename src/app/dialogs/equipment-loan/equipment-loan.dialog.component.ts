import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { global } from '../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { empty, Observable } from 'rxjs';
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';
import { DatePipe } from '@angular/common'
import { exists } from 'fs';
import {MatSnackBar} from '@angular/material/snack-bar';
import { calculateDays } from '../../services/holiday.service';


export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-equipment-loan',
  templateUrl: './equipment-loan.dialog.component.html',
  styleUrls: ['./equipment-loan.dialog.component.css']
})


export class EquipmentLoanDialog 
{
  endpoint:      string = "/equipment-loan";
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formColl:      FormGroup;
    permissions: any = null;
    component = "/inventory/procedure";
    dataSource: any=[];
    PersonaleInfo: any = [];
    collaborator: any = [];
    feed: any= [];
    idCol: number = null;
    retro: boolean = false;
    Position:      any = [];
    selectedFile:  File = null;
    tipInter: string = "";
    fechInicInc: string = "";
    public today: number = Date.now();//+
    formFeed: FormGroup;
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    typeflat:    any = [];
    typeCampus: any = [];
    dataNovNi: any = []; 
    feedInfo: any=[];
    tipMatriz:        string = "";
    rol: number;
    tipRole : string = "";
    //History
    historyMon: any = [];
    check : 0;
    displayedColumns:any  = [];
    checked = false;
    disabled = false;
    block: boolean;
    exit: any = [];
    stateSign: any = [];
    acept: any = [];
    minDate: string;
    timePermis: any = [];
    fec_ini: any = [];
    dayPer: any = [];
    final: any = [];
    CheckTrue:boolean = true;
    blockSuccess:  boolean = false;
    nuevoArchivo:any = [];
  typeCampusCambu: any = [];
  typeCampusCedro: any = [];
  stateCerti: any = [];
    soportes: string[] = [];
    getEquipos: any = [];
    authorization: any = [];
    equi_return: any = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<EquipmentLoanDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    private holiday: calculateDays,
    
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices,
    private _snackBar: MatSnackBar
    
  ) { 
    this.view = this.data.window;
    this.idCol = null;
    this.rol = this.cuser.role;
  
    switch (this.view) {
        case 'loan':
            this.tipInter = this.data.tipoMat;
            this.tipMatriz = this.data.tipoMat;
            this.tipRole = this.data.tipRole;
            this.initForms();
            this.title = "Solicitar Prestamo Equipos";
        break;
        case 'update_loan':
          this.tipInter = this.data.tipoMat;
          this.tipMatriz = this.data.tipoMat;
            this.initForms();
            this.title = "Autorizar Prerstamo Equipos";
            this.idCol = this.data.codigo;
          break;
          case 'return_loan':
            this.tipInter = this.data.tipoMat;
            this.tipMatriz = this.data.tipoMat;
              this.initForms();
              this.title = "¿ Desea devolver el equipo?";
              this.idCol = this.data.codigo;
            break;
            case 'accept_equipment':
            this.tipInter = this.data.tipoMat;
            this.tipMatriz = this.data.tipoMat;
              this.accept_equipmentUpdate(this.data.codigo);
              this.title = "¿ Desea devolver el equipo?";
              this.idCol = this.data.codigo;
            break;
          case "view_loan":
            this.title ="Detalle de Solicitud";
            this.idCol = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(
              this.endpoint + "/" + this.idCol,
              {
                token: this.cuser.token,
                idUser: this.cuser.iduser,
                modulo: this.component
              }
            ).subscribe(
              (data) => {
                if (data.success == true) {
                 
                  this.collaborator = data.data[0];

                  // this.soportes = JSON.parse(this.collaborator.file_sp.replace(/\\/g, ""));

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

  closeDialog() {
    this.dialogRef.close();
  }

  initForms() {
    //Condicion PQ Calidad
    let matParm = this.cuser.matrizarp;
    if(this.tipMatriz != "" && this.tipMatriz != null){
      matParm = this.tipMatriz;
    }  

    this.getDataInit();
    this.formColl = new FormGroup({
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      immediateBoss: new FormControl(""),
        fec_ini: new FormControl(""),
        fec_fin: new FormControl(""),
        descripcion: new FormControl(""),
        activo: new FormControl(""),
        id_cargo: new FormControl(""),
        cargo_tec: new FormControl(""),
        serial: new FormControl(""),
        observacion_tec: new FormControl(""),
        gestion_tec: new FormControl(""),
        autoriza: new FormControl(""),
        idPersonale_tec: new FormControl(this.cuser.idPersonale),
        create_User: new FormControl(this.cuser.iduser),
        
    }, );
}
generateTable(data){
  this.displayedColumns = [
    'currentm_user',
    'date_move',
    'type_move'  
  ];
  this.historyMon = data;
  this.clickedRows = new Set<PeriodicElement>();
}
getDataInit(){

  //Condicion PQ Calidad
  let matParm = this.cuser.matrizarp;
  if(this.tipMatriz != "" && this.tipMatriz != null){
    matParm = this.tipMatriz;
  }

  this.loading.emit(false);
  this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      matrizarp: matParm,
      tipRole: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
  }).subscribe(
      data => {
          if (data.success == true) {
              //DataInfo
              this.PersonaleInfo = data.data['getDataPersonale'];
              this.Position      = data.data['getPosition'];
              this.getEquipos   = data.data['getEquipos'];
              this.typeCampus = data.data['typeCampus'];
              this.stateCerti = data.data["getCertificate"];

              this.timePermis = data.data['getCertificate'];
              this.tipRole = data.data['tipRole'];
              this.typeCampusCambu = data.data['getCampusCambu'];
              this.typeCampusCedro = data.data['getCampusCedro'];
              this.authorization      = data.data['authorization'];
              this.equi_return = data.data['equi_return'];

              if (this.view == 'update_loan' || this.view == 'return_loan') {
                      this.getDataUpdate();
                  }
                      this.loading.emit(false);
          } else {
              this.handler.handlerError(data);
              this.loading.emit(false);
          }
      },
      error => {
          this.handler.showError('Se produjo un error');
          this.loading.emit(false);
      }
  );
}
onSelectCampus(idet){ 
    
  if( idet == '58'){
    this.typeflat = this.typeCampusCambu;
    // this.typeflat = this.typeCampus;
    return this.typeflat;

  }else if(idet == '59'){
    this.typeflat= this.typeCampusCedro;
    // this.typeflat= this.typeCampus;
    return this.typeflat;
  }

}
onSubmit() {
  if (this.formColl.valid) {

    

      this.loading.emit(true);
      let body = {
        listas: this.formColl.value,
        archivoRes:  this.nuevoArchivo
      }
      this.handler.showLoadin("Guardando Solicitud", "Por favor espere...");
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      }).subscribe(
        data => {
            if (data.success) {
                this.handler.showSuccess(data.message);
                this.reload.emit();
                this.closeDialog();
            } else {
                this.handler.handlerError(data);
                this.loading.emit(false);
            }
        },
        error => {
            this.handler.showError();
            this.loading.emit(false);
        }
      )
  } else {
    this.handler.showError('Complete la informacion necesaria');
    this.loading.emit(false);
  }
}
onSelectionChange(event){

  let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);

  if( exitsPersonal ){
    this.formColl.get('idPersonale').setValue(exitsPersonal.idPersonale);
    this.formColl.get('immediateBoss').setValue(exitsPersonal.jef_idPersonale);

   
  } else{
    this.formColl.get('idPersonale').setValue('');
   
  }   
}
onSelectioTec(event){
  
  let exitsPersonal = this.PersonaleInfo.find(element => element.idPersonale == event);
  if( exitsPersonal ){
    this.formColl.get('cargo_tec').setValue(exitsPersonal.idPosition);
  }
}
getDataUpdate(){
  this.loading.emit(true);
  this.WebApiService.getRequest(this.endpoint, {
      action: 'getParamUpdateSet',
      id: this.idCol,
      tipMat: this.tipMatriz,
      tipRole:this.tipRole,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component

  })
  .subscribe(
      data => {
        this.onSelectioTec(this.cuser.idPersonale);
          this.formColl.get('document').setValue(data.data['getDataUpda'][0].document);
          this.formColl.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
          this.formColl.get('activo').setValue(data.data['getDataUpda'][0].activo);
          this.formColl.get('fec_ini').setValue(data.data['getDataUpda'][0].fec_ini);
          this.formColl.get('fec_fin').setValue(data.data['getDataUpda'][0].fec_fin);
          this.formColl.get('descripcion').setValue(data.data['getDataUpda'][0].descripcion);
          this.formColl.get('serial').setValue(data.data['getDataUpda'][0].serial);
          this.formColl.get('gestion_tec').setValue(data.data['getDataUpda'][0].gestion_tec);
             
      },
      error => {
          this.handler.showError();
          this.loading.emit(false);
      }
  );
}
onSubmitUpdate(){

  let body = {
      listas: this.formColl.value,  
       tipMat: this.tipMatriz,
       id: this.idCol
  }
  if (this.formColl.valid) {
    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+this.idCol,body,{
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    })
    .subscribe(
        data=>{
            if(data.success){
                this.handler.showSuccess(data.message);
                this.reload.emit();
                this.closeDialog();
            }else{
                this.handler.handlerError(data);
                this.loading.emit(false);
            }
        },
        error=>{
          console.log(error);
            this.handler.showError(error);
            this.loading.emit(false);
        }
    );
  }else {
    this.handler.showError('Complete la informacion necesaria');
    this.loading.emit(false);
  }
}

accept_equipmentUpdate(id){

  this.formColl = new FormGroup({
    autoriza: new FormControl(1),
    idPersonale: new FormControl(this.cuser.idPersonale),
    gestion_tec: new FormControl(),
  })

  let body = {
      listas: this.formColl.value,  
       tipMat: this.tipMatriz,
       id: id
  }
  
  if (this.formColl.valid) {
    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+id,body,{
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    })
    .subscribe(
        data=>{
            if(data.success){
                this.handler.showSuccess(data.message);
                this.reload.emit();
                this.closeDialog();
            }else{
                this.handler.handlerError(data);
                this.loading.emit(false);
            }
        },
        error=>{
          console.log(error);
            this.handler.showError(error);
            this.loading.emit(false);
        }
    );
  }else {
    this.handler.showError('Complete la informacion necesaria');
    this.loading.emit(false);
  }
}



 //Acording


 

 

  
}
