import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IngresoComponent } from './ingreso/ingreso.component';
import { SuspendComponent } from './suspend/suspend.component';
import { CommisionComponent } from './commision/commision.component';


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
        },
        {
          path: 'suspend',
          component: SuspendComponent,
          data: {
            title: 'Suspensiones'
          },
        },
          {
          path: 'commisions',
          component: CommisionComponent,
          data: {
            title: 'Comision/Bono'
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
