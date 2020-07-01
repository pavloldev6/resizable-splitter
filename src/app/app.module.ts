import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ResizableSplitterModule } from '../resizable-splitter/resizable-splitter.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ResizableSplitterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
