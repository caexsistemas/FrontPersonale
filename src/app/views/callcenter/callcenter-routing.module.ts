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
import { CustomerComponent } from './customer/customer.component';
import { CargueContactComponent } from './cargue-contact/cargue-contact.component';
import { DwlcontactComponent } from "./dwlcontact/dwlcontact.component";
import { ReportsComponent } from './reports/reports.component';
import { InboundComponent } from './inbound/inbound.component';
import { MassTypingComponent } from './massTyping/massTyping.component';
import { PqrCallcenterComponent } from './pqrCallcenter/pqrCallcenter.component';


const routes: Routes = [
  {
    path: "",
    data: {
      title: "Call Center",
    },
    children: [
      {
        path: "",
        redirectTo: "PQ",
      },
      {
        path: "rqcalidad",
        component: RqcalidadComponent,
        data: {
          title: "RQ Calidad",
        },
      },
      {
        path: "feedback",
        component: FeedbackComponent,
        data: {
          title: "Feedback",
        },
      },
      {
        path: "customer",
        component: CustomerComponent,
        data: {
          title: "Medicion Customer Journey",
        },
      },
      {
        path: "dwcontac",
        component: DwlcontactComponent,
        data: {
          title: "Descarga Base",
        },
      },
      {
        path: "cargue-contact",
        component: CargueContactComponent,
        data: {
          title: "Cargue Base",
        },
      },
      {
        path: "reports",
        component: ReportsComponent,
        data: {
          title: "Reportes Call Center"
        }
      },
      {
        path: 'inbound',
        component: InboundComponent,
        data: {
          title: "Base Inbound"
        }
      },
      {
        path: 'massTyping',
        component: MassTypingComponent,
        data: {
          title: 'Tipificación Masiva'
        }
      },
      {
        path: 'pqr',
        component: PqrCallcenterComponent,
        data: {
          title: 'PQR'
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallcenterRoutingModule {}
