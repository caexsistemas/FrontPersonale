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

import { UsersComponent } from './users/users.component';
import { ListsComponent } from './lists/lists.component';
import { StateComponent } from './state/state.component';
import { RolesComponent } from './roles/roles.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ContactComponent } from './contact/contact.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Administrador'
    },
    children: [
      {
        path: '',
        redirectTo: 'users'
      },
      {
        path: 'users',
        component: UsersComponent,
        data: {
          title: 'Usuarios'
        }
      },
      {
        path: 'lists',
        component: ListsComponent,
        data: {
          title: 'Listas'
        }
      },
      {
        path: 'state',
        component: StateComponent,
        data: {
          title: 'Depertamentos'
        }
      },
      {
        path: 'roles',
        component: RolesComponent,
        data: {
          title: 'Rol'
        }
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        data: {
          title: 'Festivos'
        }
      },
      {
        path: 'contact',
        component: ContactComponent,
        data: {
          title: 'Contact User'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministratorRoutingModule { }