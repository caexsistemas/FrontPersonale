import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import { InventoryComponent } from "./InventoryComponent";
import { TechnologyComponent } from './technology/technology.component';
import { ProcedureComponent } from './procedure/procedure.component';

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
        },
        {
          path: 'procedure',
          component: ProcedureComponent,
          data: {
            title: 'Tramites de Activos'
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