import { Component, OnInit, Output, ViewChild, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TemplateComponent } from '../../../template/template.component';
import { AbsenteeismDialog } from '../../../dialogs/absenteeism/absenteeism.dialogs.component';
import { ReportsAbsenteeismComponent } from '../../../dialogs/reports/absenteeism/reports-absenteeism.component';
import { environment } from '../../../../environments/environment';
import { Console } from 'console';
import * as moment from 'moment';



@Component({
  selector: 'app-absenteeism',
  templateUrl: './absenteeism.component.html',
  styleUrls: ['./absenteeism.component.css']
})
export class AbsenteeismComponent implements OnInit {

  endpoint: string = '/absenteeisms';
  id: number = null;
  permissions: any = null;
  contenTable: any = [];
  loading: boolean = false;
  displayedColumns: any = [];
  dataSource: any = [];
  public detaNovSal = [];
  contaClick: number = 0;
  //Variables Excel
  endpointup: string = '/absenteeismsupload';
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  personaleData: any = [];
  datapersonale: any = [];
  getDaysFestiv: any = [];
  dataDelte: any = [];
  contDele: number = 0;
  hourSysm: number = 48;
  stadValue: boolean = false;
  tmajust: boolean = false;
  modal: 'successModal';
  //Control Permiso
  component = "/procesalud/absenteeisms";
  //History
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;
  @ViewChild('myCheckbox') private myCheckbox: QueryList<any>;

  public afuConfig = {

    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    maxSize: "20",
    uploadAPI: {
      url: this.url,
      method: "POST",
      headers: {
        'Authorization': this._tools.getToken()
      },
    },
    theme: "dragNDrop",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    replaceTexts: {
      selectFileBtn: 'Seleccione Archivo',
      resetBtn: 'Limpiar',
      uploadBtn: 'Subir Archivo',
      attachPinBtn: 'Sube información usuarios',
      hideProgressBar: false,
      afterUploadMsg_success: '',
      afterUploadMsg_error: 'Fallo al momento de cargar el archivo!',
      sizeLimit: 'Límite de tamaño'
    }
  };

  constructor(private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet) { }

  onTriggerSheetClick() {
    this.matBottomSheet.open(ReportsAbsenteeismComponent)
  }

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }

    sendRequest(){
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint, {
        action: 'getDatanovedadAll',
        idUser: this.cuser.iduser,
        role: this.cuser.role,
        matrizarp: this.cuser.matrizarp,
        token: this.cuser.token,
        modulo: this.component
      })
        .subscribe(
       
          data => {
            
              if (data.success == true) {
                  this.permissions = this.handler.getPermissions(this.component);
                  this.generateTable(data.data['getContData']);
                  this.contenTable   = data.data['getContData'];
                  this.getDaysFestiv = data.data['getFestivos'];
                  this.loading = false;
  
              } else {
                  this.handler.handlerError(data);
                  this.loading = false;
              }
          },
          (mistake) => {
            let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
            //let msjErr = mistake.error.message;
            this.handler.showError(msjErr);
            this.loading = false;
          },
       
      );
  }

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      'check',
      'view',
      'document',
      'fecha_ingreso',
      'name',
      'namejefe',
      'matrizarp',
      'motivo',
      'fecha_ausencia',
      'fecha_finausen',
      'actions'
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector('search-input-table'))) {
      search = document.querySelector('.search-input-table');
      search.value = "";
    }
  }

  //Filtro Tabla
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  //Modales
  showDetails(item) {
    this.detaNovSal = item;
    this.infoModal.show()
  }
  //Cabecera
  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }

  option(action, codigo = null) {
    var dialogRef;
    switch (action) {
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(AbsenteeismDialog, {
          data: {
            window: 'create',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(AbsenteeismDialog, {
          data: {
            window: 'update',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(AbsenteeismDialog, {
          data: {
            window: 'view',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
          console.log(result);
        });
        break;
    }
  }

  getAllPersonal() {
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDatUpload',
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component
    })
      .subscribe(
        response => {
          this.permissions = this.handler.getPermissions(this.component);
          if (response.success) {
            this.handler.showSuccess('El archivo se cargo exitosamente');
            this.personaleData = response.data;
            this.loading = false;
            this.successModal.hide();
            this.sendRequest();
          } else {
            this.datapersonale = [];
            this.handler.handlerError(response);
          }
        },
        (mistake) => {
          let msjErr = "Se produjo un Error al cargar el Archivo";
          //let msjErr = mistake.error.message;
          this.handler.showError(msjErr);
          this.loading = false;
        }
      );
  }

  validAsPect(id, checkbox) {

    if (checkbox.checked) {
      this.dataDelte.push(id);
    } else {
      var i = this.dataDelte.indexOf(id);
      this.dataDelte.splice(i, 1);
    }

    console.log(this.dataDelte);
  }

  deleInfo() {

    if(this.dataDelte.length > 0){
      if( this.contDele == 0 ){
        this.handler.shoWarning('¿Esta Seguro?', 'De estar seguro, por favor de Click de nuevo en eliminar. Total a eliminar: '+this.dataDelte.length);
        this.contDele++;
        this.stadValue = true;
      } else {
        this.loading = true;
        this.WebApiService.getRequest(this.endpoint, {
          action: 'getDelinfo',
          idDel: "" + JSON.stringify(this.dataDelte),
          idUser: this.cuser.iduser,
          token: this.cuser.token,
          modulo: this.component
        })
          .subscribe(

            data => {
             
                if (data.success == true) {
                    //DataInfo
                    this.handler.showSuccess('Registros eliminados exitosamente.');
                    this.loading = false;
                    this.stadValue = false;
                    this.sendRequest();
                } else {
                    this.handler.handlerError(data);
                    this.loading = false;
                    this.stadValue = false;
                }
            },
            error => {
                this.handler.showError('Se produjo un error al eliminar los registros');
                this.loading = false;
                this.stadValue = false;
                this.sendRequest();
              } 
            
          );
        this.contDele = 0;
      }
    } else {
      this.handler.showError('Por favor seleccionar algún registro.');
    }
  }

  //Validacion Festivos 
  getFestCalen(fechaing, horas){

    var Extr = 0;
    //Validar Festivos de Pormedio
    var fecha = new Date(fechaing);
    var fechaIni = fechaing.split(' ');
    fecha.setHours(fecha.getHours() + horas);
    var fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    var fechaTxt = fechaLocal.toISOString();
    //Formateo Fecha
    var fecha_date = fechaTxt.split('T');
    var fechaFin = fecha_date[0];
    //Validar Festivos en Tabla Calendario
    this.getDaysFestiv.forEach(element => {
      if(element >= fechaIni[0] && element <= fechaFin){
        Extr = Extr + 24;
      }
    });
    //Validar Domingos 
    return Extr;
  }

  //Validar Dia Domingos
  getDominCalen(fechaing, horas){

    var fechaInicial = new Date(fechaing);
    var fechaFinal = new Date(fechaInicial.getTime() + horas * 60 * 60 * 1000);
    // Contador de domingos
    var domingos = 0;
    // Mientras la fecha sea menor o igual a la fecha final, verificamos si es un domingo y aumentamos el contador
    while (fechaInicial <= fechaFinal) {
      if (fechaInicial.getDay() === 0) {
        domingos++;
      }
      fechaInicial.setTime(fechaInicial.getTime() + 24 * 60 * 60 * 1000); // Avanzar un día
    }

    return (24 * domingos);
  }

  validatAjust(fechaing) {
    //Horas aumentar
    var horas = this.hourSysm;
    //Fecha De Radicacion
    var fecha = new Date(fechaing);
    //Si los Ausentismo se cargan un sabado se aumentan un dia o domingo
    horas = horas + this.getFestCalen(fechaing, horas);
    horas = horas + this.getDominCalen(fechaing, horas);
    //Conversion Hora Local
    fecha.setHours(fecha.getHours() + horas);
    var fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    var fechaTxt = fechaLocal.toISOString();
    //Separacion Formato y fecha con 48 horas
    var fecha_date = fechaTxt.split('T');
    var fec_time = fecha_date[1].split('.');
    var fec_date = fecha_date[0];
    var fechaFin = fec_date + ' ' + fec_time[0];
    //Se Compara Fecha Actual 
    var hoy = new Date();
    var fechAct = hoy.getFullYear() + '-' + `0${hoy.getMonth() + 1}`.slice(-2) + '-' + `0${hoy.getDate()}`.slice(-2);
    var horAtc = `0${hoy.getHours()}`.slice(-2) + ':' + `0${hoy.getMinutes()}`.slice(-2) + ':' + `0${hoy.getSeconds()}`.slice(-2);
    var timeActu = fechAct + ' ' + horAtc;
    //Validacion si el tiempo actual esta en las 48 horas pactadas (fechaing)
    if (timeActu >= fechaing && timeActu <= fechaFin) {
      this.tmajust = true;
    } else {
      this.tmajust = false;
    }

    /*console.log('------------');
    console.log(fechaing + 'Ingreso');
    console.log(fechaFin + 'Fin');
    console.log(timeActu + 'Actual');
    console.log(this.tmajust);
    console.log('------------');*/
  }

  colorMap = {
    "60/9": "#f6c705"
  };

  colorState(state) {
    return this.colorMap[state] || "#959595"; // Devuelve el color correspondiente o cadena vacía si no coincide
  }

  //Chequeo Sistema
  notCheckHour(fechaing, motivo){
        //Horas aumentar
        var horas = this.hourSysm;
        //Fecha De Radicacion
        var fecha = new Date(fechaing);
        //Si los Ausentismo se cargan un sabado se aumentan un dia o domingo
        horas = horas + this.getFestCalen(fechaing, horas);
        horas = horas + this.getDominCalen(fechaing, horas);
        //Conversion Hora Local
        fecha.setHours(fecha.getHours() + horas);
        var fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
        var fechaTxt = fechaLocal.toISOString();
        //Separacion Formato y fecha con 48 horas
        var fecha_date = fechaTxt.split('T');
        var fec_time = fecha_date[1].split('.');
        var fec_date = fecha_date[0];
        var fechaFin = fec_date + 'T' + fec_time[0];
        //Texto info
        var text = '<table class="table">';
        text += '<tbody>';

        text += '<tr>';
        text += '<td><b>Horas Habilitadas</b></td>';
        text += '<td>'+this.hourSysm+'</td>';
        text += '</tr>';

        let fechaMoment = moment(fechaFin);
        let fechaFormateada = fechaMoment.format('YYYY-MM-DD hh:mm:ss A');

        text += '<tr>';
        text += '<td><b>Finaliza</b></td>';
        text += '<td>'+fechaFormateada+'</td>';
        text += '</tr>';

        text += '</tbody>';
        text += '</table>';
        this.handler.showInfo(text, '¡Tiempo de Gestión!', '#/procesalud/absenteeisms');
        //console.log(fechaing);
  }

}
