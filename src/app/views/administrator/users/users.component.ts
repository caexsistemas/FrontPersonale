import { Component, OnInit, ViewChild,QueryList,ViewChildren } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { UserServices } from '../../../services/user.service';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UsersDialog } from '../../../dialogs/users/users.dialog.component';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [Tools, UserServices]
})

export class UsersComponent implements OnInit {
  
  public data;
  public detailUser     = [];
  datauser : any        = [];
  dataSource:any        = [];
  displayedColumns:any  = [];
  loading:boolean = false;


  endpoint:string   = '/usuario';

  permissions:any = null;

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private _UserService: UserServices, 
    private _tools: Tools,
    private WebApiService:WebApiService,
    public handler:HandlerAppService,
    public dialog:MatDialog){}
   
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
}

sendRequest(){
  this.WebApiService.getRequest(this.endpoint,{
  })
  .subscribe(
    response=>{
      // this.permissions = this.handler.getPermissions(this.component);
      if(response.success){
        console.log(response)
        this.generateTable(response.data);
        this.datauser = response.data
        this.loading = false;
      }else{
        this.datauser = [];
        this.handler.handlerError(response);
      }
    },
    error=>{
      // this.loading = false;
      // this.permissions = this.handler.getPermissions(this.component);
      // this.handler.showError();
    }
  );
}

generateTable(data){
  this.displayedColumns = [
    'view', 
    'idUser',
    'name',
    'email',
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
      dialogRef = this.dialog.open(UsersDialog,{
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
      dialogRef = this.dialog.open(UsersDialog,{
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
        dialogRef = this.dialog.open(UsersDialog,{
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
    // case 'active':
    //   this.updateStatus('active');
    // break;
    // case 'inactive':
    //   this.updateStatus('inactive');
    // break;
  }

}

  showDetails(item) {
    this.detailUser = item;
    this.infoModal.show()
  }

}
