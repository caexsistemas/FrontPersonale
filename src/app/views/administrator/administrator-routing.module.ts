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

import { UsersComponent } from './users/list/users.component';
import { UserCreateComponent } from './users/create/user-create.component';

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
        path: 'users-create',
        component: UserCreateComponent,
        data: {
          title: 'Crear Usuario'
        }
      },
      {
        path: 'edit/:idUser',
        component: UserCreateComponent,
        data: {
          title: 'Modificar Usuario'
        }
      },
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministratorRoutingModule { }