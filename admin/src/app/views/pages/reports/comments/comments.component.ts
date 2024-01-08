import { Component } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent {
  listData: any = [];
  allData: any = [];
  reportedCount: any;
  blockedCount: any;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getListData();
  }

  getListData() {
    this.api.GET('admin/report/comment').subscribe((response: any) => {
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

  reportChangeStatus(type: string, comment_id: string) {
    Swal.fire({
      text: `Are you sure you want to ${type} this comment?`,
      icon: 'question',
      confirmButtonColor: '#D32E56',
      cancelButtonColor: '#000000',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api
          .GET(`admin/report/comment/change-status/${type}/${comment_id}`)
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

  getTimeDifferenceText(timestamp: any) {
    const currentTime = Date.now(); // Get the current timestamp in milliseconds

    timestamp = new Date(timestamp).getTime();
    const differenceInMilliseconds = currentTime - timestamp;

    const minutesAgo = Math.floor(differenceInMilliseconds / (1000 * 60));
    const hoursAgo = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const daysAgo = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    if (minutesAgo < 60) {
      return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
    } else if (hoursAgo < 24) {
      return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutesAgo < 10080) {
      //7 days into minutes
      return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
    } else {
      return moment(timestamp).format('ll');
    }
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
