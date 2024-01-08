import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/public/pages/login/login.component';
import { OverviewComponent } from './views/pages/overview/overview.component';
import { ReportsComponent } from './views/pages/reports/reports.component';
import { CommentsComponent } from './views/pages/reports/comments/comments.component';
import { PostsComponent } from './views/pages/reports/posts/posts.component';
import { CustomerComponent } from './views/pages/customer/customer.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login',
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login',
    },
  },
  {
    path: 'overview',
    component: OverviewComponent,
    data: {
      title: 'Overview',
    },
  },
  {
    path: 'report',
    component: ReportsComponent,
    data: {
      title: 'Report',
    },
    children: [
      {
        path: '',
        redirectTo: 'posts',
        pathMatch: 'full',
      },
      {
        path: 'comments',
        component: CommentsComponent,
      },
      {
        path: 'posts',
        component: PostsComponent,
      },
    ],
  },
  {
    path: 'customer',
    component: CustomerComponent,
    data: {
      title: 'Customer',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
