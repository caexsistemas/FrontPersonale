import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagementComponent } from './management.component';



const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Personal'
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
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManagementRoutingModule { }
