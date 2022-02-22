import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncapasinsopComponent } from './incapasinsop.component';



const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Incapacidades Sin Soporte'
        },
        children: [
            {
                path: '',
                redirectTo: 'gestion'
            },
            {
                path: 'gestion',
                component: IncapasinsopComponent, 
                data: {
                    title: 'gestion'
                }
            }
        ]
    }
]; 

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IncapasinsopRoutingModule { }
