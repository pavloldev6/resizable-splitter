import { NgModule } from '@angular/core';

import { ResizableSplitterComponent } from './resizable-splitter.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [ResizableSplitterComponent],
  declarations: [ResizableSplitterComponent],
  providers: [],
})
export class ResizableSplitterModule { }
