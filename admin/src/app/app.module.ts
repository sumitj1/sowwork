import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './containers/layouts/sidebar/sidebar.component';
import { LoginComponent } from './views/public/pages/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { TokenInterceptor } from './shared/interceptor/token.interceptor';
import { OverviewComponent } from './views/pages/overview/overview.component';
import { ReportsComponent } from './views/pages/reports/reports.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PostsComponent } from './views/pages/reports/posts/posts.component';
import { CommentsComponent } from './views/pages/reports/comments/comments.component';
import { NgChartsModule } from 'ng2-charts';
import { CustomerComponent } from './views/pages/customer/customer.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    LoginComponent,
    OverviewComponent,
    ReportsComponent,
    PostsComponent,
    CommentsComponent,
    CustomerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTabsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      maxOpened: 1,
      preventDuplicates: true,
      autoDismiss: true,
      positionClass: 'toast-top-center',
    }),
    NgChartsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
