import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  headingTitle: String = 'Post';
  ngOnInit() {}

  updateHeadingitle = (headingTitle: String) => {
    this.headingTitle = headingTitle;
  };
}
