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
//import { ListasDialog } from '../../../dialogs/lists/lists.dialog.component';

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

     @ViewChildren(MatSort) sort = new QueryList<MatSort>();
     @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

    constructor(
        //private _UserService: UserServices, 
        private _tools: Tools,
        private WebApiService:WebApiService,
        public handler:HandlerAppService,
        public dialog:MatDialog){}

    ngOnInit(): void {

        this.sendRequest();
        this.permissions = this.handler.permissionsApp;
        // this._UserService.getAllUser().subscribe(response => {
        //   this.data = response
        // },
        //   error => {
        //     //console.log(<any>error)
        //     if (<any>error.status == 401) {
        //       this._tools.goToPage('login')
        //     } else if (<any>error.status == 500) {
        //       this._tools.showNotify("error", "GESTIN", "Error Interno")
        //     } else if (<any>error.status == 403) {
        //       this._tools.goToPage('403')
        //     }
        //   }
        // )  
    }

    //Consultar Estados
    sendRequest() {

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getDatasatate'
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    this.generateTable(data.data['states']);
                    this.valuestate = data.data['states'];
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


    }


  }