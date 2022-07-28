import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { HiringComponent } from "./hiring/hiring.component";
import { PendingComponent } from "./pending/pending.component";
import { RequisitionComponent } from "./requisition/requisition.component";
import { TrainingComponent } from "./training/training.component";
import { VacantComponent } from "./vacant/vacant.component";

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Selection",
    },
    children: [
      {
        path: "",
        redirectTo: "",
      },
      {
        path: "requisition",
        component: RequisitionComponent,
        data: {
          title: "Requisition",
        },
      },
      {
        path: "pending",
        component: PendingComponent,
        data: {
          title: "Pending",
        },
      },
      {
        path: "vacant",
        component: VacantComponent,
        data: {
          title: "Vacant",
        },
      },
      {
        path: "training",
        component: TrainingComponent,
        data: {
          title: "Training",
        },
      },
      {
        path: "hiring",
        component: HiringComponent,
        data: {
          title: "Hiring",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectionRoutingModule {}
