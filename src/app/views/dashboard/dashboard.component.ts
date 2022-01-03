import { Component, OnInit } from '@angular/core';
import { Tools } from '../../Tools/tools.page'

@Component({
  templateUrl: 'dashboard.component.html',
  providers: [Tools]

})
export class DashboardComponent implements OnInit {
  public identity;
  public token;
  public data;
  constructor(private _tools: Tools, ){
      this.identity=_tools.getIdentity();
      this.token=_tools.getToken();
  }
  ngOnInit(): void {
    if(this.token==null){
      //this._tools.goToPage('login')
    }
    

}

}
