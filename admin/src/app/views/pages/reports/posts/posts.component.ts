import { Component } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent {
  listData: any = [];
  allData: any = [];
  reportedCount: any;
  blockedCount: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getListData();
  }

  getListData() {
    this.api.GET('admin/report/post').subscribe((response: any) => {
      if (response.error) {
        this.api.errorAlert(response.message);
        this.listData = [];
        this.allData = [];
      } else {
        this.listData = response.data;
        this.allData = response.data;
        this.reportedCount = response.reportedCount;
        this.blockedCount = response.blockedCount;
      }
    });
  }

  reportChangeStatus(type: string, post_id: string) {
    Swal.fire({
      text: `Are you sure you want to ${type} this post?`,
      icon: 'question',
      confirmButtonColor: '#D32E56',
      cancelButtonColor: '#000000',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api
          .GET(`admin/report/post/change-status/${type}/${post_id}`)
          .subscribe((response: any) => {
            if (response.error) {
              this.api.errorAlert(response.message);
            } else {
              this.api.successAlert(response.message);
            }
            this.getListData();
          });
      }
    });
  }

  search(event: any) {
    const keyword = event.target.value;

    if (keyword) {
      this.listData = this.allData.filter((e: any) =>
        e._id.toLowerCase().includes(keyword.toLowerCase())
      );
    } else {
      this.listData = this.allData;
    }
  }
}
