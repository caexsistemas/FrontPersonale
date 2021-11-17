import { Component, OnInit, ViewChild } from '@angular/core';
import { Tools } from '../../../../Tools/tools.page';
import { UserServices } from '../../../../services/user.service';
import { WebApiService } from '../../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UsersDialog } from '../../../../dialogs/users/users.dialog.component';
import { HandlerAppService } from '../../../../services/handler-app.service';
import { MatDialog } from '@angular/material/dialog';







@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [Tools, UserServices]
})

export class UsersComponent implements OnInit {
  
  public data;
  public detailUser = [];
  datauser : any    = [];
  loading:boolean = false;
  endpoint:string   = '/usuario';

  permissions:any = null;

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

sendRequest(){
  this.WebApiService.getRequest(this.endpoint,{
  })
  .subscribe(
    response=>{
      // this.permissions = this.handler.getPermissions(this.component);
      if(response.success){
        this.data = response.data
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
