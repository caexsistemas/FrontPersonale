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
    this.matBottomSheet.open(TemplateComponent)
  }
  
  ngOnInit(): void {
      this.sendRequest();
      this.permissions = this.handler.permissionsApp;
  }

  sendRequest(){
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDatanovedad'
    })
      .subscribe(
     
        data => {
            if (data.success == true) {
                this.generateTable(data.data['getContData']);
                this.contenTable = data.data['getContData'];
                this.loading = false;

            } else {
                this.handler.handlerError(data);
                this.loading = false;
            }
        },
        error => {
            console.log(error);
            this.handler.showError('Se produjo un error');
            this.loading = false;
        }
      );
  }

   //Tabla Contenido
   generateTable(data){
    this.displayedColumns = [
      'view', 
      'id_disinf',
      'document_vs',
      'idPersonale',
      'area',
      'tipo_gestion',
      'nombentreinc',
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

  option(action,codigo=null){
    
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
              console.log('The dialog was closed');
              console.log(result);
            });
        break;
      }
  }

}
