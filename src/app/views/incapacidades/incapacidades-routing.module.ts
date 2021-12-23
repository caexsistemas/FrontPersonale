import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncapacidadesComponent } from './incapacidades.component';



const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Incapacidades'
        },
        children: [
            {
                path: '',
                redirectTo: 'gestion'
            },
            {
                path: 'gestion',
                component: IncapacidadesComponent, 
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
export class IncapacidadesRoutingModule { }
