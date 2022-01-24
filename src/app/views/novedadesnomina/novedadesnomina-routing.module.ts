import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IngresoComponent } from './ingreso/ingreso.component';

const routes: Routes = [

  {
    path: '',
    data: {
      title: 'NovedadesNomina'
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
            title: 'Ingreso'
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
