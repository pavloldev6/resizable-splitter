import { Component, Input, TemplateRef, ViewChild, ElementRef, Renderer2, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { takeUntil, tap, throttleTime } from 'rxjs/operators';

const PIXELS_FROM_EDGE = 3;

@Component({
  selector: 'app-resizable-splitter',
  template: `
    <div class="splitter" [ngClass]="{'vertical': isVertical, 'horizontal': !isVertical}" #container>
      <div class="frame" #frame1Container>
        <ng-container *ngTemplateOutlet="firstFrame; context: firstFrameContext"></ng-container>
      </div>
      <div class="handle" #handle (mousedown)='onHandlePress()'>
        <div class="handle-area"></div>
      </div>
      <div class="frame" #frame2Container>
        <ng-container *ngTemplateOutlet="secondFrame; context: secondFrameContext"></ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./resizable-splitter.component.scss']
})

export class ResizableSplitterComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() isVertical = true;
  @Input() firstFrame: TemplateRef<any>;
  @Input() secondFrame: TemplateRef<any>;
  @Input() firstFrameSize = 50; // in percentage
  @Input() firstFrameContext: any = {};
  @Input() secondFrameContext: any = {};

  @ViewChild('frame1Container', { static: true }) frame1Container: ElementRef;
  @ViewChild('frame2Container', { static: true }) frame2Container: ElementRef;
  @ViewChild('container', { static: true }) container: ElementRef;
  @ViewChild('handle', { static: true }) handle: ElementRef;

  private lastPos = { clientX: null, clientY: null};
  private mouseMoved$;
  private mouseReleased$;
  private subscription: Subscription;
  private pixelsFromEdge = PIXELS_FROM_EDGE;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.mouseMoved$ = fromEvent(document, 'mousemove').pipe(
      tap((event: MouseEvent) => event.preventDefault())
    );
    this.mouseReleased$ = fromEvent(document, 'mouseup').pipe(
      tap(() => {
        this.lastPos.clientX = null;
        this.lastPos.clientY = null;
      })
    );
    this.subscription = fromEvent(window, 'resize')
    .subscribe({
      next: () => this.updateFrames()
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.updateFrames();
  }

  onHandlePress = () => {
    this.mouseMoved$.pipe(
      throttleTime(40),
      takeUntil(this.mouseReleased$)
    ).subscribe({
      next: (event: MouseEvent) => {
        this.onHandleDrag(event);
      }
    });
  }

  private onHandleDrag(event: MouseEvent) {
    if (this.lastPos.clientX && this.lastPos.clientY) {
      if (this.isVertical) {
        const yDiff = event.clientY - this.lastPos.clientY;
        this.firstFrameSize = this.calculateFirstFrameHeight(yDiff);
      } else {
        const xDiff = event.clientX - this.lastPos.clientX;
        this.firstFrameSize = this.calculateFirstFrameWidth(xDiff);
      }
      this.updateFrames();
    }

    if (!this.isVertical && event.clientX <= this.container.nativeElement.offsetLeft) {
      this.lastPos.clientX = this.container.nativeElement.offsetLeft - 1;
    } else if (this.isVertical && event.clientY <= this.container.nativeElement.offsetTop) {
      this.lastPos.clientY = this.container.nativeElement.offsetTop - 1;

    } else {
      this.lastPos.clientX = event.clientX;
      this.lastPos.clientY = event.clientY;
    }
  }

  private getFirstFrame(): number {
    return this.firstFrameSize;
  }

  private getSecondFrame(): number {
    return 100 - this.firstFrameSize;
  }

  private calculateFirstFrameHeight = (yDiff: number) => {
    const handleOffset = this.handle.nativeElement.offsetHeight;
    const totalHeight = this.container.nativeElement.offsetHeight;
    const stopPosition = handleOffset + this.pixelsFromEdge;
    let heightFrame1 = this.frame1Container.nativeElement.offsetHeight + yDiff + (handleOffset / 2);
    if (heightFrame1 > (totalHeight - stopPosition)) {
      heightFrame1 = totalHeight - stopPosition;
    } else if (heightFrame1 < stopPosition) {
      heightFrame1 = stopPosition;
    }
    const heightPercent = (heightFrame1 / totalHeight) * 100;
    return heightPercent;
  }

  private calculateFirstFrameWidth = (xDiff: number) => {
    let handleOffset;
    let handleHalf;
    if (this.firstFrameSize === 0) {
      handleOffset = 0;
      handleHalf = 0;
    } else {
      handleOffset = this.handle.nativeElement.offsetWidth;
      handleHalf = handleOffset / 2;
    }
    const stopPosition = handleOffset + this.pixelsFromEdge;
    const totalWidth = this.container.nativeElement.offsetWidth;
    let widthFrame1 = this.frame1Container.nativeElement.offsetWidth + xDiff + handleHalf;
    if (widthFrame1 > (totalWidth - stopPosition)) {
      widthFrame1 = totalWidth - stopPosition;
    } else if (widthFrame1 < stopPosition) {
      widthFrame1 = stopPosition;
    }
    const widthPercent = (widthFrame1 / totalWidth) * 100;
    return widthPercent;
  }

  private updateFrames() {
    console.log('update');
    let handleOffset = 0;
    if (this.isVertical) {
      handleOffset = this.firstFrameSize === 0 ? 0 : this.handle.nativeElement.clientHeight / 2;

      this.renderer.setStyle(this.frame1Container.nativeElement, 'height',
      this.getStyleCalculation(this.getFirstFrame(), handleOffset));

      this.renderer.setStyle(this.frame2Container.nativeElement, 'height',
        this.getStyleCalculation(this.getSecondFrame(), handleOffset));
    } else {
      handleOffset = this.firstFrameSize === 0 ? 0 : this.handle.nativeElement.clientWidth / 2;

      this.renderer.setStyle(this.frame1Container.nativeElement, 'width',
        this.getStyleCalculation(this.getFirstFrame(), handleOffset));

      this.renderer.setStyle(this.frame2Container.nativeElement, 'width',
        this.getStyleCalculation(this.getSecondFrame(), handleOffset));
    }
  }

  private getStyleCalculation(frameSize: number, handleOffset: number) {
    return `calc(${frameSize}% - ${handleOffset}px)`;
  }

}
