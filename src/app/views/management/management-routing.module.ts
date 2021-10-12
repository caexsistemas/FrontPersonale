import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagementCreateComponent } from './create/management-create.component';
import { ManagementComponent } from './management.component';



const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Personale'
        },
        children: [
            {
                path: '',
                redirectTo: 'gestion'
            },
            {
                path: 'gestion',
                component: ManagementComponent,
                data: {
                    title: 'Gestion de personal'
                }
            },
            {
                path: 'gestion-create',
                component:ManagementCreateComponent,
                data:{
                    title:'Crear personal'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManagementRoutingModule { }
