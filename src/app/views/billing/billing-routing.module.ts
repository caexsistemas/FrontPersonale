import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import { CampaignMobileComponent } from './campaign-mobile/campaign-mobile.component';

const routes: Routes = [
    {
      path: '',
      data: {
        title: 'Facturacion'
      },
      children: [
        {
            path: '',
            redirectTo: ''
        },
        {
            path: 'campaign-mobile',
            component: CampaignMobileComponent, 
            data: {
                title: 'Movil'
            }
        }
    ]
  }
];
    




@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class BillingRoutingModule { }