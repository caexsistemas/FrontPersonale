import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListMeetingComponent } from './list-meeting/list-meeting.component';


const routes: Routes = [
  {
    path: "",
    data:{
      title: "Procesos de Formación"
    },
    children:[
      {
        path:"",
        redirectTo:""
      },
      {
        path:"list-meeting",
        component:ListMeetingComponent,
        data:{
          title:"Creacion de Capacitaciones"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeetingRoutingModule { }
