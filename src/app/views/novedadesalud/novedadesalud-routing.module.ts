import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProcessaludComponent } from './processalud/processalud.component';

const routes: Routes = [

  {
    path: '',
    data: {
      title: 'NovedadeSalud'
    },
      children: [
        {
          path: '',
          redirectTo: 'processalud'
        },
        {
          path: 'processalud',
          component: ProcessaludComponent,
          data: {
            title: 'Novedades Medicas'
          }
        }
      ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessaludRoutingModule { }