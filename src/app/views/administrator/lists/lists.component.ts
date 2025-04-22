import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { global } from '../../../services/global';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ListasDialog } from '../../../dialogs/lists/lists.dialog.component';



@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css'],
  providers: [Tools]
})

export class ListsComponent implements OnInit {

  public data;
  public detaLists = [];
  datalist: any = [];
  loading: boolean = false;
  endpoint: string = '/listas';
  dataSource: any = [];
  displayedColumns: any = [];
  valorLista: any = [];
  contaClick:  number = 0;
  component = "/admin/lists";
  permissions: any = null;
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  public filters = { searchId: "", searchName: "" }

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    //private _UserService: UserServices, 
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog) { }

  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    })
      .subscribe(
        response => {
          
          if (response.success) {
            this.permissions = this.handler.getPermissions(this.component);
            this.generateTable(response.data);
            this.valorLista = response.data
            this.loading = false;
          } else {
            this.valorLista = [];
            this.handler.handlerError(response);
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

  generateTable(data) {
    this.displayedColumns = [
      'view',
      'name_ing',
      'name_esp',
      'list_id',
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

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  option(action, codigo = null) {
    var dialogRef;
    switch (action) {
      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(ListasDialog, {
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
          // console.log('The dialog was closed');
          // console.log(result);
        });
        break;
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(ListasDialog, {
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
        dialogRef = this.dialog.open(ListasDialog, {
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
      // case 'active':
      //   this.updateStatus('active');
      // break;
      // case 'inactive':
      //   this.updateStatus('inactive');
      // break;
    }

  }

  showDetails(item) {
    this.detaLists = item;
    this.infoModal.show()
  }

  
  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }
}
