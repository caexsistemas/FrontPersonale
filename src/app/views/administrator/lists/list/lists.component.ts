import { Component, OnInit, ViewChild } from '@angular/core';
import { Tools } from '../../../../Tools/tools.page';
import { WebApiService } from '../../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../../services/handler-app.service';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css'],
  providers: [Tools]
})

export class ListsComponent implements OnInit {
  
  public data;
  public detaLists = [];
  datalist : any    = [];
  loading:boolean = false;
  endpoint:string   = '/listas';
  permissions:any = null;

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
        console.log('1')
        // this.permissions = this.handler.getPermissions(this.component);
        if(response.success){
          this.data = response.data
        }else{
          this.datalist = [];
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
       
      break;
      case 'create':
       
      break;
      case 'update':
         
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


}
