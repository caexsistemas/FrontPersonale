import {Component} from '@angular/core';
import { Tools } from '../../Tools/tools.page';
import { navItems } from '../../_nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  providers:[Tools]
})
export class DefaultLayoutComponent  {
  public sidebarMinimized = false;
  public navItems = navItems;
  public identity;
  public token;
  constructor(private _tools: Tools, ){    

      this.identity=_tools.getIdentity();
      this.token=_tools.getToken();
      console.log('-->'+this.identity)
      
     if(this.token==null){
        this._tools.goToPage('login')
      }
  }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  
}
