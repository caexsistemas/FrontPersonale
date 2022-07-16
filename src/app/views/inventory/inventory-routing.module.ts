import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import { InventoryComponent } from "./InventoryComponent";
import { TechnologyComponent } from './technology/technology.component';

const routes: Routes = [
    {
      path: '',
      data: {
        title: 'Inventory'
      },
      children: [
        {
            path: '',
            redirectTo: ''
        },
        {
            path: 'technology',
            component: TechnologyComponent, 
            data: {
                title: 'Technology'
            }
        }
    ]
  }
];
    




@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class InventoryRoutingModule { }