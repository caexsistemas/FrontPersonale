/**
    * @description      : 
    * @author           : Maricel Jimenez
    * @group            : 
    * @created          : 25/06/2021 - 15:02:54
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 25/06/2021
    * - Author          : Maricel Jimenez
    * - Modification    : 
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import { FeedbackComponent } from './feedback/feedback.component';
import { RqcalidadComponent } from './rqcalidad/rqcalidad.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Call Center'
    },
    children: [
      {
        path: '',
        redirectTo: 'PQ'
      },
      {
        path: 'rqcalidad',
        component: RqcalidadComponent,
        data: {
          title: 'RQ Calidad'
        }
      },
      {
        path: 'feedback',
        component: FeedbackComponent,
        data: {
          title: 'Feedback'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallcenterRoutingModule { }