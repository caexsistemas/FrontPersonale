import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagementComponent } from './management.component';
import { CertificatesComponent } from './certificates/certificates.component';



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
            {
                path: 'certificates',
                component: CertificatesComponent,
                data: {
                    title: 'Gestion de Certificados'
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
