import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from './../../../environments/environment';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  API_URL: any = environment.API_URL;
  MEDIA_URL: any = `${this.API_URL}/public/uploads`;
  errorStatus: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  //set Session
  setSession(sessionData: any) {
    window.localStorage.setItem('session', JSON.stringify(sessionData));
  }

  //get session
  getSession() {
    return localStorage.getItem('session') || null;
  }

  //delete session
  deleteSession() {
    localStorage.removeItem('session');
    this.router.navigate(['login']);
  }

  //get user Id
  getUserId() {
    let session: any = this.getSession();
    return session?.userData?._id || null;
  }

  //get User Token
  getUserToken() {
    let session: any = this.getSession();
    session = JSON.parse(session);
    return session?.token || null;
  }

  /***************  CRUD APIS ************/

  //GET
  GET(url: string) {
    return this.http.get<Response>(`${this.API_URL}/api/v1/${url}`);
  }

  //POST
  POST(url: string, data: any) {
    return this.http.post<Response>(`${this.API_URL}/api/v1/${url}`, data);
  }

  //GET BY ID
  GET_BY_ID(url: string, id: any) {
    return this.http.get<Response>(`${this.API_URL}/api/v1/${url}/${id}`);
  }

  /************** OTHER APIS ***************/

  uploadImage(data: any) {
    return this.http.post<Response>(
      `${this.API_URL}/api/v1/upload-image`,
      data
    );
  }

  /*********** ALERTS *************/

  successAlert(message: any) {
    Swal.fire({
      text: message,
      icon: 'success',
      timer: 1500,
      // color: "#ffffff",
      // background: '#000000',
      confirmButtonColor: '#D32E56',
    });
  }

  errorAlert(message: any) {
    Swal.fire({
      text: message,
      icon: 'error',
      timer: 1500,
      // background: '#000000',
      confirmButtonColor: '#D32E56',
    });
  }

  warningAlert(message: any) {
    Swal.fire({
      text: message,
      icon: 'warning',
      timer: 1500,
      // background: '#000000',
      confirmButtonColor: '#D32E56',
    });
  }

  infoAlert(message: any) {
    Swal.fire({
      text: message,
      icon: 'info',
      timer: 1500,
      // background: '#000000',
      confirmButtonColor: '#ffb1b1',
    });
  }

  successToastr(message: any) {
    this.toastr.success(message);
  }

  warningToastr(message: any) {
    this.toastr.success(message);
  }

  errorToastr(message: any) {
    this.toastr.error(message);
  }
}
