import { Component, OnInit, Output, ViewChild, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProcessaludDialog } from '../../../dialogs/processalud/processalud.dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TemplateComponent } from '../../../template/template.component';
import { ReportProcessaludComponent } from '../../../dialogs/reports/processalud/reports-processalud.component';

@Component({
  selector: 'app-processalud',
  templateUrl: './processalud.component.html',
  styleUrls: ['./processalud.component.css']
})
export class ProcessaludComponent implements OnInit {

  endpoint:string   = '/procesald';
  id: number = null;
  permissions:any = null;
  contenTable : any     = [];
  loading:boolean = false;
  displayedColumns:any  = [];
  dataSource:any        = [];
  public detaNovSal = [];
  contaClick:  number = 0;
  contDele:    number = 0;
  stadValue:   number = 0;
  //Control Permiso
  component = "/procesalud/processalud";
  //History
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  constructor(
    private _tools: Tools,
    private WebApiService:WebApiService,
    public handler:HandlerAppService,
    public dialog:MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }


  onTriggerSheetClick(){
    this.matBottomSheet.open(ReportProcessaludComponent)
  }
  
  ngOnInit(): void {
      this.sendRequest();
      this.permissions = this.handler.permissionsApp;
  }

  sendRequest(){
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDatanovedad',
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    })
      .subscribe(
     
        data => {
            if (data.success == true) {
                this.permissions = this.handler.getPermissions(this.component);
                this.generateTable(data.data['getContData']);
                this.contenTable = data.data['getContData'];
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
        }
      );
  }

   //Tabla Contenido
   generateTable(data){
    this.displayedColumns = [
      'view', 
      'fechageneracion',
      'document_vs',
      'idPersonale',
      'area',
      'soporte_nove',
      'tipo_gestion',
      'fechainicausen',
      'fechafinausen',
      'estado_gs',
      'actions'
    ];
    this.dataSource           = new MatTableDataSource(data);
    this.dataSource.sort      = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if(document.contains(document.querySelector('search-input-table'))){
      search = document.querySelector('.search-input-table');
      search.value = "";
    }
}

  //Filtro Tabla
  applyFilter(search){
    this.dataSource.filter = search.trim().toLowerCase();
  }

  //Modales
  showDetails(item) {
    this.detaNovSal = item;
    this.infoModal.show()
  }

  option(action,codigo=null,estado=null){
    
      var dialogRef;
      switch(action){
          case 'create':
            this.loading = true;
            dialogRef = this.dialog.open(ProcessaludDialog,{
              data: {
                window: 'create',
                codigo
              }
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.sendRequest();
            });
        break;
        case 'update':
            this.loading = true;
            dialogRef = this.dialog.open(ProcessaludDialog,{
              data: {
                window: 'update',
                codigo
              }
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.sendRequest();
            });
          break;
        case 'view':
            this.loading = true;
            dialogRef = this.dialog.open(ProcessaludDialog,{
              data: {
                window: 'view',
                codigo
              }
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            dialogRef.afterClosed().subscribe(result => {
              //console.log('The dialog was closed');
              //console.log(result);
            });
        break;
        case 'delete':
          if( estado == '30/1' ){
            if( this.contDele == 0 ){

              this.handler.shoWarning('¿Esta Seguro?', 'De estar seguro, por favor de Click de nuevo en Eliminar');
              this.contDele++;
              this.stadValue = codigo;
            }else if( this.stadValue == codigo){
             
              this.contDele = 0;
              this.stadValue = 0;
              this.deleteIforma(codigo);           
            }else{
  
              this.handler.showError('Por favor escoger el mismo registro');
              this.contDele = 0;
              this.stadValue = 0;
            }
          }else{

              this.handler.shoWarning('¡Atento!', 'Escoger registros que estén en estado Pendiente, Gracias');
              this.contDele = 0;
              this.stadValue = 0;
          }
          
        break;
      }
  }

  
  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }

  deleteIforma(codigo){

    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDataDelete',
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      codigo: codigo,
      token: this.cuser.token,
      modulo: this.component
    })
      .subscribe(
     
        data => {
          this.permissions = this.handler.getPermissions(this.component);
            if (data.success == true) {
              
              this.handler.showSuccess('El registro se ha eliminado exitosamente');
              this.loading = false;
              this.sendRequest();
            } else {
                this.handler.handlerError(data.message);
                this.loading = false;
            }            
        },
        error => {
            this.handler.showError('Se produjo un error al eliminar el registro');
            this.loading = false;
        }
      );
    
    //console.log(codigo+" vic");
  }

  colorMap = {
    "30/1": "#f6c705",
    "30/2": "#23c100",
    "30/3": "#f23b34",
    "30/4": "#959595",
    "30/5": "#ff8d21"
  };

  colorState(state) {
    return this.colorMap[state] || ""; // Devuelve el color correspondiente o cadena vacía si no coincide
  }

}
