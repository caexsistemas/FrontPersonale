import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IngresoComponent } from './ingreso/ingreso.component';

const routes: Routes = [

  {
    path: '',
    data: {
      title: 'Novedad Nomina'
    },
      children: [
        {
          path: '',
          redirectTo: 'ingreso'
        },
        {
          path: 'ingreso',
          component: IngresoComponent,
          data: {
            title: 'Ingreso-Retiro'
          }
        }
      ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NovedadesnominaRoutingModule { }
