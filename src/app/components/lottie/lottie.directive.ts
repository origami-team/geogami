import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import lottie, { AnimationConfigWithPath, AnimationItem } from 'lottie-web';

// Where the animation file is and how to play it (everything lottie-web takes,
// except the container, which is the element the directive sits on).
export type LottieOptions = Omit<AnimationConfigWithPath, 'container'>;

// <div lottie [options]="{ path: 'assets/lottie/x.json', renderer: 'svg', autoplay: true, loop: true }">
//
// Plays a Lottie animation inside the element. Does what the `lottie` directive
// of ngx-lottie did for this app, which it replaces: the animation is created
// once when the element appears, drawn outside Angular's change detection (it
// redraws every frame), and destroyed with the element so nothing keeps
// running after the page is left.
@Directive({ selector: '[lottie]' })
export class LottieDirective implements OnInit, OnDestroy {
  @Input() options: LottieOptions;

  private animation?: AnimationItem;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit() {
    if (!this.options) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.animation = lottie.loadAnimation({
        ...this.options,
        container: this.host.nativeElement,
      });
    });
  }

  ngOnDestroy() {
    this.animation?.destroy();
    this.animation = undefined;
  }
}
