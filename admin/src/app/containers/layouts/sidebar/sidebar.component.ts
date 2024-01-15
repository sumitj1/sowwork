import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from 'src/app/shared/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public isCollapsed = true;
  constructor(public api: ApiService) {}

  ngOnInit() {
    this.isCollapsed = true;
  }

  logout = () => {
    Swal.fire({
      text: 'Are you sure you want to logout?',
      icon: 'question',
      confirmButtonColor: '#D32E56',
      cancelButtonColor: '#000000',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteSession();
      }
    });
  };
}
