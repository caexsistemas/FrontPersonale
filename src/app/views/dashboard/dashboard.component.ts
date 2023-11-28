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
import { log } from 'console';


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
// array que pintan informacion de la api 
  public GrafiHogar: any = [];
  public GrafiMovil: any = [];
  public GrafiTyt: any = [];
  public GrafiSupe: any = [];
  public GrafiA: any = [];
  public selectCampan: any = [];
  public TablAnalista: any = [];
  public dataSource: any = [];
  public displayedColumns: any = [];
// variables para renderizado
  public mensajeNc = 0; 
  public colornC = 0;
  public TablAnalistac = 0;
  public TablAnalistacN = 0;
  public TablAnalistacus = 0;
  public analistaNota = 0;
  public NotaHogar = 0;
  public NotaMovil = 0;
  public NotaTyt  = 0;
  public GrafiSuper = 0;
  public GrafiSuperv = 0;
  public GrafiAs = 0;
  public nombreA = "";
  public documentoA = 0;
  public descripCampana = 0; 
  public notaF = 0;
  public conteo = 0;
  public conteoA = 0;
  public colors = "";
  public mensajeA = "";
  public nota_utilaB = 0;
// colores del grafico de barra Agentes
  public color_G="";
  public color_A1="";
  public color_N="";
  public color_A2="";
  public grafico_g="";
  public grafico_a1="";
  public grafico_n="";
  public grafico_a2="";
// tyt 
  public grafico_gt="";
  public grafico_a1t="";
  public grafico_nt="";
  public grafico_a2t="";
  public campana="";
  public notaCalidad="";
  public estado=0;
  public NotaAsesor =""; 
  public obs_asp_pos ="";
  public obs_obs ="";
  public textSelecamp="Seleccionar...";
// variable boolean
  public rolC: boolean = false;
  public grafiSuper: boolean = false;
  public grafiAgentes: boolean = false;
// direccion para laravel
  endpoint: string = "/grafiContact";
// permisos 
  component = "/callcenter/grafiContact";
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  public campanaConsu=this.cuser.campana;
// trae informacion de modales 
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective; 
  @ViewChildren(MatSort) sort = new QueryList<MatSort>(); 
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();                                                                                                                                                                              
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(    
    _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef ){
      this.identity=_tools.getIdentity();
      this.token=_tools.getToken();
  }
  ngAfterViewInit(): void {
    // console.log( this.cuser.role);
    if( this.cuser.role == 21 || this.cuser.role == 22 ){ 
    this.rolC = true;
    this.sendRequest()
    .then(()=>{
      this.graCalid();
    });
  }else if(this.cuser.role == 31 || this.cuser.role == 2){
    // console.log( this.cuser.role);
    this.grafiSuper = true;
    this.sendRequest()
    .then(()=>{
      this.grafiSupervisor();
    });
  }else if(this.cuser.role == 23){
    // console.log( this.cuser.role);
    this.grafiAgentes = true;
    this.sendRequest()
    .then(()=>{
      this.grafiAgente();
    });
  }
  this.cdr.detectChanges();
}

// customer(){
//   console.log('Monitores:', this.TablAnalista.dato.monitorCalCus);
// }

// getColorForNota(nota: number): string {
//   if (nota >= 0 && nota <= 50) {
//     return '#DB0E0E'; 
//   } else if (nota > 50 && nota <= 100) {
//     return '#FAE128'; 
//   } else {
//     return '#1674E3';
//   }
// }


    // graficos pára calidad 
graCalid(){
    //Cargue de Graficos
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.load('current', {'packages':['bar']});
    //Grafico Hogar
    google.charts.setOnLoadCallback(() => {this.grama_barra(this.GrafiHogar, 'grama_hogar_barra','model_gana_barra', 'grafico_barra');});
    google.charts.setOnLoadCallback(() => {this.grama_linea(this.GrafiHogar, 'grama_hogar_lineal','campanas_lineal', 'grafico_lineal');});
    this.NotaHogar = this.GrafiHogar['dato']['califica'];

    //Grafico Movil
    google.charts.setOnLoadCallback(() => {this.grama_barra(this.GrafiMovil, 'grama_movil_barra','model_gana_barra', 'grafico_barra');});
    google.charts.setOnLoadCallback(() => {this.grama_linea(this.GrafiMovil, 'grama_movil_lineal','campanas_lineal', 'grafico_lineal');});
    this.NotaMovil = this.GrafiMovil['dato']['califica'];
    //Grafico Tyt
    google.charts.setOnLoadCallback(() => {this.grama_barra(this.GrafiTyt, 'grama_tyt_barra','model_gana_barra', 'grafico_barra');});
    google.charts.setOnLoadCallback(() => {this.grama_linea(this.GrafiTyt, 'grama_tyt_lineal','campanas_lineal', 'grafico_lineal');});
    this.NotaTyt = this.GrafiTyt['dato']['califica'];
}
// Graficos supervisor 
grafiSupervisor(){

  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.load('current', {'packages':['bar']});
  //Grafico Hogar
  google.charts.setOnLoadCallback(()  =>{this.grama_barra(this.GrafiSupe, 'grama_super_barra', 'model_gana_barra', 'grafico_barra');});
  google.charts.setOnLoadCallback(()  =>{this.grama_linea(this.GrafiSupe, 'grama_super_lineal', 'campanas_lineal', 'grafico_lineal');});
  this.GrafiSuper = this.GrafiSupe['dato']['califica'];
  this.GrafiSuperv = this.GrafiSupe['dato']['segmento'];
}
// Graficos agentes
grafiAgente(){

  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.load('current', {'packages':['bar']});

  if(Array.isArray(this.GrafiA.dato.DataAsesor)){

    google.charts.setOnLoadCallback(()  =>{this.grama_barra2(this.GrafiA, 'grama_agente_barra','NotaAsesor');});
    google.charts.setOnLoadCallback(()  =>{this.grama_donugnt(this.GrafiA, 'grama_agente_dona','nota_final');});
    this.conteoA = this.GrafiA.dato.DataAsesor[0].conteo;
    this.descripCampana = this.GrafiA.dato.DataAsesor[0].des_campana;
    this.documentoA = this.GrafiA.dato.DataAsesor[0].document;
    this.nombreA = this.GrafiA.dato.DataAsesor[0].nombre;
    this.colors = this.GrafiA.dato.UtilAser.colors;
    this.mensajeA = this.GrafiA.dato.UtilAser.mensaje;
    this.nota_utilaB = this.GrafiA.dato.UtilAser.nota_util;
  }else{

    document.getElementById('grama_agente_dona').innerHTML  = '';
    document.getElementById('grama_agente_barra').innerHTML  = '';
    document.getElementById('grama_agente_barra_carga').style.display = 'flex';
    this.conteoA = 0;
    this.descripCampana = 0;
    this.documentoA = 0;
    this.nombreA = "";
    this.colors = "";
    this.mensajeA = "";
    this.nota_utilaB = 0; 
  }
}

campanasMenu(event,text){

  this.textSelecamp = text;
  this.campanaConsu = event;
  this.grafiAgentes = true;
  this.sendRequest()
  .then(()=>{
    this.grafiAgente();
  });
  this.cdr.detectChanges(); 
}

modalComent(event){
 var texto = "";
 var titulo = "";
 var arrayText = this.GrafiA.dato.ObsAsesor;

 for(var i = 0; i < arrayText.length ; i++ ){
  if( event == 1){ 
    texto += '<p>  <b>'+(i+1)+'</b> '+arrayText[i]['obs_asp_pos']+' </p>'; 
    titulo = "Apectos Positivos";
  }else{
    texto += '<p>  <b>'+(i+1)+'</b> '+arrayText[i]['obs_obs']+' </p>'; 
    titulo = "Oportunidades de Mejora";
  }
 }
  this.handler.showInfo(texto,titulo,"#/callcenter/rqcalidad");
}
sendRequest(): Promise<void> {
  return new Promise<void>((resolve) => {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDataCustomer11",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component,
      matriz: this.cuser.matrizarp,
      document: this.cuser.username,
      campana: this.campanaConsu
    }).subscribe(
      (data) => {
        if (data.success == true) {
          if( this.cuser.role == 21 || this.cuser.role == 22 ){ 
            this.GrafiHogar = data.data['GrafiHogar']; 
            this.GrafiMovil = data.data['GrafiMovil']; 
            this.GrafiTyt   = data.data['GrafiTYT']; 
            this.generateTable(data.data['TablAnalista']['dato']['monitorCalCus']);
            this.TablAnalista   = data.data['TablAnalista']['dato']['monitorCalCus']; 
            console.log('==>',this.TablAnalista);
            console.log('==>',this.GrafiTyt);
            
          }else if(this.cuser.role == 31 || this.cuser.role == 2){
            this.GrafiSupe = data.data['GrafiSupe']; 
          }else if(this.cuser.role == 23){
            this.GrafiA = data.data ['GrafiA'];
            this.selectCampan = data.data['tipicampana'];
          }
          resolve();
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      () => {
        //console.log(error);
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  });
}

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "nombre_apellido",
      "description",
      "final_note",
      "modlo",
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }

    if(this.cuser.role == 21 ){
      this.applyFilter(this.cuser.iduser, 'createUser');
    }
  }

   //Filtro Tabla
   applyFilter(filterValue: string | number, column: string) {
   // Si el valor del filtro es un número, conviértelo a cadena
   const filterString = typeof filterValue === 'number' ? filterValue.toString() : filterValue;

   // Define el filtro personalizado para la columna 'final_note'
   const customFilter = (data: any, filter: string) => {
     const columnValue = data[column].toString();
     return columnValue.includes(filter);
   };
 
   // Asigna el filtro personalizado para la columna
   this.dataSource.filterPredicate = customFilter;
 
   // Aplica el filtro
   this.dataSource.filter = filterString.trim().toLowerCase();
  }

// GRAFICO BARRAS
grama_barra(infodata,divdata,cabecera,valores) {

  var arreglo = infodata['dato'][cabecera].split(',');
  var valgras = infodata['dato'][valores];

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
grama_linea(infodata,divdata,cabecera,valores) {
  var arreglo = infodata['dato'][cabecera].split(',');
  var valgras = infodata['dato'][valores];
  
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

 // Donugnt
 grama_donugnt(infodata,divdata,nota) {
  if (infodata && infodata['dato'] && infodata['dato']['DataAsesor']) {
    const nota_final = parseInt(infodata['dato']['DataAsesor'][0][nota]);
    const resta_cal = 100 - nota_final;

    const data = new google.visualization.DataTable();
    data.addColumn('string', 'calidad');
    data.addColumn('number', 'Notas de calidad');
    data.addRows([
      ['Nota Calidad', nota_final],
      ['Por Mejorar', resta_cal]
    ]);

    const options = {
      title: 'Promedio Calidad',
      pieHole: 0.3,
      colors: ['#2789FF','#FF3D04'],
      width: 500,
      height: 500,
      bar: { groupWidth: "100%" },
      legend: {
        position: "top",
        labels: {
          font: { size: 14 }
        }
      }
    };
    const chart = new google.visualization.PieChart(document.getElementById(divdata));
    chart.draw(data, options);
  } else {
    // console.error('Datos incorrectos o no definidos: DataAsesor no encontrado');
  }
}
// Grafico barras Agentes
    grama_barra2(infodata,divdata,NotaA) {
     const campana = infodata['dato']['DataAsesor'][0]['campana'];
      var finaG = 0;
      var finaA = 0;
      var finaN = 0;
      var finaA2 = 0;

      if(campana == '44/6' || campana == '44/5'){
          finaG =parseInt(infodata['dato']['NotaAsesor'][0]['GT_F']); 
          finaA  =parseInt(infodata['dato']['NotaAsesor'][0]['A1T_F']); 
          finaN =parseInt(infodata['dato']['NotaAsesor'][0]['NT_F']); 
          finaA2=parseInt(infodata['dato']['NotaAsesor'][0]['A2T_F']); 
        }else{
          finaG =parseInt(infodata['dato']['NotaAsesor'][0]['G_F']); 
          finaA =parseInt(infodata['dato']['NotaAsesor'][0]['A1_F']); 
          finaN =parseInt(infodata['dato']['NotaAsesor'][0]['N_F']); 
          finaA2 =parseInt(infodata['dato']['NotaAsesor'][0]['A2_F']); 
      }
    // Aui color de barra 
      var colorG = "";
      var colorA = "";
      var colorN = "";
      var colorA2 = "";

      colorG  =    (finaG < 50)  ? "#FF3D04": "#2789FF ";
      colorA  =    (finaA < 50)  ? "#FF3D04": "#2789FF ";
      colorN  =    (finaN < 50)  ? "#FF3D04": "#2789FF ";
      colorA2 =    (finaA2< 50)  ? "#FF3D04": "#2789FF ";
      // console.log('"'+colorG+'"');
      // console.log('"'+colorN+'"'+finaN);

      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Modelo');
      data.addColumn('number', 'Calificacion');
      data.addColumn({ type: 'string', role: 'style' });
      data.addRows([       
      ['G',  finaG,   colorG],
      ['A1', finaA,   colorA],
      ['N',  finaN,   colorN],
      ['A2', finaA2, colorA2] 
    ]);

      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,{
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
      }, 2]);
    
      var options = {
        title: "Modelo GANA",
        width: 600,
        height: 500,
        bar: { groupWidth: "95%" },
        legend: { position: "none" }
      };
    
      document.getElementById(divdata+'_carga').style.display = 'none';
    var chart = new google.visualization.ColumnChart(document.getElementById(divdata));
    chart.draw(data, google.charts.Bar.convertOptions(options));
  }
 };

