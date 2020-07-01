import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'resizable-splitter';

  topLeftContext = {
    colour: '#D7A9E3FF'
  };

  topRightContext = {
    $implicit: '#A8D5BAFF'
  };
}
