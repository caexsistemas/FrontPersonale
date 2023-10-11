import { Component, OnInit, ViewChild, QueryList, ViewChildren,Output,EventEmitter,AfterViewInit,ChangeDetectorRef  } from "@angular/core";
import { Tools } from "../../Tools/tools.page";
import { WebApiService } from "../../services/web-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { HandlerAppService } from "../../services/handler-app.service";
import { global } from "../../services/global";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatBottomSheet } from '@angular/material/bottom-sheet';

declare var google: any;

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.css'],
  providers: [Tools]
})
export class DashboardComponent implements AfterViewInit  {
  public identity;
  public token;
  public data;
  permissions: any = null;
  public GrafiHogar: any = [];
  public GrafiMovil: any = [];
  public GrafiTyt: any = [];
  public NotaHogar = 0;
  public NotaMovil = 0;
  public NotaTyt  = 0;
  public rolC: boolean;
// direccion para laravel
  endpoint: string = "/grafiContact";
// permisos 
  component = "/callcenter/grafiContact";
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
// trae informacion de modales 
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(    
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef ){
      this.identity=_tools.getIdentity();
      this.token=_tools.getToken();
  }
  ngAfterViewInit(): void {
    console.log( this.cuser.role);
    if( this.cuser.role == 21 || this.cuser.role == 22  ){ 
    this.rolC = true;
    this.sendRequest()
    .then(()=>{
      this.graCalid();
    });
  }else{
    this.rolC = false;
  }
  this.cdr.detectChanges();
}
graCalid(){
    //Cargue de Graficos
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.load('current', {'packages':['bar']});
    //Grafico Hogar
    google.charts.setOnLoadCallback(()  =>{this.grama_barra(this.GrafiHogar, 'grama_hogar_barra');});
    google.charts.setOnLoadCallback(() => {this.grama_linea(this.GrafiHogar, 'grama_hogar_lineal');});
    this.NotaHogar = this.GrafiHogar['dato']['califica'];

    //Grafico Movil
    google.charts.setOnLoadCallback(() => {this.grama_barra(this.GrafiMovil, 'grama_movil_barra');});
    google.charts.setOnLoadCallback(() => {this.grama_linea(this.GrafiMovil, 'grama_movil_lineal');});
    this.NotaMovil = this.GrafiMovil['dato']['califica'];
    //Grafico Tyt
    google.charts.setOnLoadCallback(() => {this.grama_barra(this.GrafiTyt, 'grama_tyt_barra');});
    google.charts.setOnLoadCallback(() => {this.grama_linea(this.GrafiTyt, 'grama_tyt_lineal');});
    this.NotaTyt = this.GrafiTyt['dato']['califica'];
}

sendRequest(): Promise<void> {

  return new Promise<void>((resolve) => {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDataCustomer",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    }).subscribe(
      (data) => {
        
        if (data.success == true) {
  
          this.GrafiHogar = data.data['GrafiHogar']; 
          this.GrafiMovil = data.data['GrafiMovil']; 
          this.GrafiTyt   = data.data['GrafiTYT']; 
          resolve();
          
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      (error) => {
        //console.log(error);
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  });
}

// GRAFICO BARRAS
grama_barra(infodata,divdata) {

  var arreglo = infodata['dato']['model_gana_barra'].split(',');
  var valgras = infodata['dato']['grafico_barra'];

  var data = new google.visualization.DataTable();
  data.addColumn('string', arreglo[0].replace(/'/g, ''));
  //Encabezado
  for (var i = 1; i < arreglo.length; i++) {
    data.addColumn('number', arreglo[i].replace(/'/g, ''));
  }
  //Valores
  var dataRes = [];
  for (var i = 0; i < valgras.length; i++) {
    dataRes = valgras[i].replace(/'/g, '').split(',');
    var pars = [];
    pars.push(dataRes[0]);
    for(var j = 1; j < dataRes.length; j++){
      pars.push(parseInt(dataRes[j]));
    }
    data.addRow(pars);
  }

  var options = {
    chart: {
      title: 'MODELO GANA (Mes En Curso)',
      titleTextStyle: {
        color: 'black', // Cambia el color del texto del título a rojo
      }
    },
    bars: 'vertical', // Required for Material Bar Charts.
  legend: { position: 'top',
  textStyle: {
    fontSize: 13,
    // Tamaño de fuente deseado para la leyenda
  } } // También puedes ajustar la posición de la leyenda

  };
  document.getElementById(divdata+'_carga').style.display = 'none';
  var chart = new google.charts.Bar(document.getElementById(divdata));
  chart.draw(data, google.charts.Bar.convertOptions(options));
 };


// GRAFICO DE LINEA
grama_linea(infodata,divdata) {
   
  var arreglo = infodata['dato']['campanas_lineal'].split(',');
  var valgras = infodata['dato']['grafico_lineal'];
  
  var data = new google.visualization.DataTable();
  data.addColumn('string', arreglo[0].replace(/'/g, ''));
  //Encabezado
  for (var i = 1; i < arreglo.length; i++) {
    data.addColumn('number', arreglo[i].replace(/'/g, ''));
  }
  //Valores
  var dataRes = [];
  for (var i = 0; i < valgras.length; i++) {
    dataRes = valgras[i].replace(/'/g, '').split(',');
    var pars = [];
    pars.push(dataRes[0]);
    for(var j = 1; j < dataRes.length; j++){
      pars.push(parseInt(dataRes[j]));
    }
    data.addRow(pars);
  }

  //console.log((arreglo.length-2)+"arreglo:"+infodata['dato']['model_gana_barra']);
  //console.log((valgras.length-2)+"valgra"+infodata['dato']['grafico_lineal']);
  //console.log("can: "+(dataRes.length - 2));

  var contBar = dataRes.length;
  var seriesOptions = {};
  seriesOptions[(contBar - 2)] = { type: 'line' };

  var options = {
    title: 'Promedio Calidad (Ultimos 4 Meses )',
    titleTextStyle: {
      fontSize: 18, // Tamaño de fuente deseado para el título
      color: '#959595',
    },
    curveType: 'function',
    legend: { position: 'bottom' },
    seriesType: 'bars',
    series: seriesOptions
  };
  var chart = new google.visualization.ComboChart(document.getElementById(divdata));
  chart.draw(data, options);
 }
}


