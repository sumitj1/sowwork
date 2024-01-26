import { Component } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent {
  listData: any = [];
  allData: any = [];
  userDetails: any = null;
  userSubDetails: string = 'info';
  constructor(public apiService: ApiService) {}

  ngOnInit(): void {
    this.getListData();
  }

  getListData() {
    this.apiService.GET('admin/users/artist').subscribe((response: any) => {
      if (response.error) {
        this.apiService.errorAlert(response.message);
        this.listData = [];
        this.allData = [];
      } else {
        this.listData = response.data;
        this.allData = response.data;
      }
    });
  }

  showUserDetails(user: any) {
    this.userSubDetails = 'info';
    this.userDetails = user;
  }

  setUserSubData(userSubDetails: string) {
    this.userSubDetails = userSubDetails;
  }

  changeStatus(type: string) {
    Swal.fire({
      text: `Are you sure you want to ${type} this address?`,
      icon: 'question',
      confirmButtonColor: '#D32E56',
      cancelButtonColor: '#000000',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        //delete api here

        this.apiService.successAlert('Address deleted successfully.');
      }
    });
  }
}
