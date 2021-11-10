import { Component, OnInit, ViewChild } from '@angular/core';
import { Tools } from '../../../../Tools/tools.page';
import { UserServices } from '../../../../services/user.service';
import { WebApiService } from '../../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';



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
  endpoint:string   = '/usuario';

  constructor(
    private _UserService: UserServices, 
    private _tools: Tools,
    private WebApiService:WebApiService){}
   
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  ngOnInit(): void {
    this.sendRequest();
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
        console.log(response.data);
        // this.generateTable(data.data);
        //this.datauser = data.data;
        this.data = response.data
      }else{
        this.datauser = [];
        console.log('Falle');

        // this.handler.handlerError(data);
      }
    },
    error=>{
      // this.loading = false;
      // this.permissions = this.handler.getPermissions(this.component);
      // this.handler.showError();
    }
  );
}



  showDetails(item) {
    this.detailUser = item;
    this.infoModal.show()
  }

}
