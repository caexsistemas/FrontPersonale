import { Component, OnInit, Output, ViewChild, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { global } from '../../../services/global';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { StateDialog } from '../../../dialogs/state/state.dialog.component';

@Component({
    selector: 'app-state',
    templateUrl: './state.component.html',
    styleUrls: ['./state.component.css'],
    providers: [Tools]
  })


  export class StateComponent implements OnInit {

    endpoint:string   = '/state';
    id: number = null;
    valuestate : any     = [];
    permissions:any = null;
    dataSource:any        = [];
    displayedColumns:any  = [];
    loading:boolean = false;
    public detaState = [];
    //Permisos
    component = "/admin/state";

     @ViewChildren(MatSort) sort = new QueryList<MatSort>();
     @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

    constructor(
        //private _UserService: UserServices, 
        private _tools: Tools,
        private WebApiService:WebApiService,
        public handler:HandlerAppService,
        public dialog:MatDialog){}

    @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

    ngOnInit(): void {
        this.sendRequest();
        this.permissions = this.handler.permissionsApp; 
    }

    //Consultar Estados
    sendRequest() {

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getDatasatate'
        })
        .subscribe(
           
            data => {
              this.permissions = this.handler.getPermissions(this.component);
                if (data.success == true) {
                    this.generateTable(data.data['states']);
                    this.valuestate = data.data['states'];
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

    generateTable(data){
        this.displayedColumns = [
          'view', 
          'idState',
          'name',
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

    
    applyFilter(search){
        this.dataSource.filter = search.trim().toLowerCase();
    }

    option(action,codigo=null){

        var dialogRef;

        switch(action){

          case 'view':
            this.loading = true;
            dialogRef = this.dialog.open(StateDialog,{
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

          case 'create':
            this.loading = true;
            dialogRef = this.dialog.open(StateDialog,{
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
            dialogRef = this.dialog.open(StateDialog,{
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

        }


    }

    showDetails(item) {
        this.detaState = item;
        this.infoModal.show()
    }

  }