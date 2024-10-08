import { Component, OnInit, Output, ViewChild, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { IngresoDialog } from '../../../dialogs/ingresonomi/ingreso.dialog.component';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TemplateComponent } from '../../../template/template.component';
import { ReportIngresoComponent } from '../../../dialogs/reports/ingreso/reports-ingreso.component';


@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css'],
  providers: [Tools]
})




export class IngresoComponent implements OnInit {

  endpoint:string   = '/novnomi';
  id: number = null;
  permissions:any = null;
  contenTable : any     = [];
  loading:boolean = false;
  displayedColumns:any  = [];
  dataSource:any        = [];
  public detanovNomi = [];
  contaClick:  number = 0;
  //Permisos
  component = "/nomi/ingreso";
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
  
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  onTriggerSheetClick(){
    this.matBottomSheet.open(ReportIngresoComponent)
  }
  
  ngOnInit(): void {
      this.sendRequest();
      this.permissions = this.handler.permissionsApp; 
      
  }

  sendRequest(){
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDatanoven',
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    })
      .subscribe(
     
        data => {
          console.log(this.permissions);
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
      'created_at',
      'document',
      'name',
      'area',
      'cargo',
      'date_nov',
      'state_his',
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
    this.detanovNomi = item;
    this.infoModal.show()
  }

  //Acciones
  option(action,codigo=null){
    var dialogRef;
    switch(action){
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(IngresoDialog,{
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
        dialogRef = this.dialog.open(IngresoDialog,{
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
          dialogRef = this.dialog.open(IngresoDialog,{
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

  
  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }
}
