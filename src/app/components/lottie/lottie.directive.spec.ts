import { Component, NgZone } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import lottie from "lottie-web";
import { LottieDirective, LottieOptions } from "./lottie.directive";

@Component({
  template: `<div id="host" *ngIf="show" lottie [options]="options"></div>`,
})
class HostComponent {
  show = true;
  options: LottieOptions | null = {
    path: "assets/lottie/star-success.json",
    renderer: "svg",
    autoplay: true,
    loop: true,
  };
}

describe("LottieDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let load: jasmine.Spy;
  let destroyAnimation: jasmine.Spy;
  let ranInAngularZone: boolean | undefined;

  beforeEach(() => {
    destroyAnimation = jasmine.createSpy("destroy");
    ranInAngularZone = undefined;
    load = spyOn(lottie, "loadAnimation").and.callFake((() => {
      ranInAngularZone = NgZone.isInAngularZone();
      return { destroy: destroyAnimation };
    }) as any);
    TestBed.configureTestingModule({ declarations: [HostComponent, LottieDirective] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it("starts the animation in the element it sits on, with the given options", () => {
    fixture.detectChanges();
    expect(load).toHaveBeenCalledTimes(1);
    const config = load.calls.mostRecent().args[0];
    expect(config.container).toBe(fixture.nativeElement.querySelector("#host"));
    expect(config.path).toBe("assets/lottie/star-success.json");
    expect(config.renderer).toBe("svg");
    expect(config.autoplay).toBe(true);
    expect(config.loop).toBe(true);
  });

  it("draws outside Angular's zone, so every frame does not trigger change detection", () => {
    fixture.detectChanges();
    expect(ranInAngularZone).toBe(false);
  });

  it("creates the animation once, not on every change detection run", () => {
    fixture.detectChanges();
    fixture.detectChanges();
    fixture.detectChanges();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does nothing without options", () => {
    fixture.componentInstance.options = null;
    fixture.detectChanges();
    expect(load).not.toHaveBeenCalled();
    fixture.componentInstance.show = false;
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it("destroys the animation when the element is removed", () => {
    fixture.detectChanges();
    expect(destroyAnimation).not.toHaveBeenCalled();
    fixture.componentInstance.show = false;
    fixture.detectChanges();
    expect(destroyAnimation).toHaveBeenCalledTimes(1);
  });

  it("destroys the animation when the whole page is destroyed", () => {
    fixture.detectChanges();
    fixture.destroy();
    expect(destroyAnimation).toHaveBeenCalledTimes(1);
  });

  it("each element gets its own animation, and each is destroyed", () => {
    fixture.detectChanges();
    const second = TestBed.createComponent(HostComponent);
    second.detectChanges();
    expect(load).toHaveBeenCalledTimes(2);
    second.destroy();
    expect(destroyAnimation).toHaveBeenCalledTimes(1);
    fixture.destroy();
    expect(destroyAnimation).toHaveBeenCalledTimes(2);
  });
});
