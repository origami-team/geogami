import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import QRCode, { QRCodeErrorCorrectionLevel } from "qrcode";
import { QrCodeComponent } from "./qr-code.component";

@Component({
  template: `<app-qr-code
    [value]="value"
    [cssClass]="cssClass"
    [width]="width"
    [errorCorrectionLevel]="level"
    [alt]="alt"
  ></app-qr-code>`,
})
class HostComponent {
  value = "https://example.org/play?x=1";
  cssClass = "class-qr-code";
  width = 600;
  level: QRCodeErrorCorrectionLevel = "M";
  alt: string | undefined;
}

describe("QrCodeComponent", () => {
  let fixture: ComponentFixture<HostComponent>;
  let toDataURL: jasmine.Spy;

  const root = (): HTMLElement => fixture.nativeElement.querySelector("app-qr-code");
  const img = (): HTMLImageElement | null => root().querySelector("div > img");

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    // the qrcode library itself is covered by the browser tests (decoded pictures); here: the component
    toDataURL = spyOn(QRCode, "toDataURL").and.callFake(((value: string) => Promise.resolve(`data:image/png;base64,${btoa(value)}`)) as any);
    TestBed.configureTestingModule({ declarations: [HostComponent, QrCodeComponent] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it("renders the picture as an img directly inside a div carrying the given class", async () => {
    await render();
    const holder = root().querySelector("div") as HTMLElement;
    expect(holder.classList.contains("class-qr-code")).toBe(true);
    expect(img()!.parentElement).toBe(holder); // `.class-qr-code > img` and `.class-qr-code img` both match
    expect(img()!.getAttribute("src")).toBe(`data:image/png;base64,${btoa("https://example.org/play?x=1")}`);
  });

  it("asks the qrcode library for the same options ngx-qrcode used, with the page's width and level", async () => {
    await render();
    expect(toDataURL).toHaveBeenCalledWith("https://example.org/play?x=1", {
      errorCorrectionLevel: "M",
      margin: 4,
      scale: 4,
      width: 600,
      color: { dark: "#000", light: "#FFF" },
    });
  });

  it("uses the ngx-qrcode defaults when only a value is given (width 10, medium)", async () => {
    @Component({ template: `<app-qr-code value="abc"></app-qr-code>` })
    class MinimalHost {}
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ declarations: [MinimalHost, QrCodeComponent] });
    const minimal = TestBed.createComponent(MinimalHost);
    minimal.detectChanges();
    await minimal.whenStable();
    expect(toDataURL.calls.mostRecent().args[1]).toEqual({
      errorCorrectionLevel: "M",
      margin: 4,
      scale: 4,
      width: 10,
      color: { dark: "#000", light: "#FFF" },
    });
    expect(minimal.nativeElement.querySelector("div").className).toBe("qrcode");
  });

  it("passes the error correction level on", async () => {
    fixture.componentInstance.level = "L";
    await render();
    expect(toDataURL.calls.mostRecent().args[1].errorCorrectionLevel).toBe("L");
  });

  it("draws a new picture when the value changes", async () => {
    await render();
    fixture.componentInstance.value = "https://example.org/other";
    await render();
    expect(img()!.getAttribute("src")).toBe(`data:image/png;base64,${btoa("https://example.org/other")}`);
  });

  it("removes the picture when the value becomes empty, instead of leaving the old code on screen", async () => {
    await render();
    expect(img()).not.toBeNull();
    fixture.componentInstance.value = "";
    await render();
    expect(img()).toBeNull();
  });

  it("shows nothing for an empty value from the start", async () => {
    fixture.componentInstance.value = "";
    await render();
    expect(img()).toBeNull();
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it("only lets the newest value update the picture when an older request finishes later", async () => {
    let resolveSlow!: (v: string) => void;
    toDataURL.and.callFake(((value: string) =>
      value === "slow" ? new Promise<string>((r) => (resolveSlow = r)) : Promise.resolve(`data:image/png;base64,${btoa(value)}`)) as any);
    fixture.componentInstance.value = "slow";
    fixture.detectChanges();
    fixture.componentInstance.value = "fast";
    await render();
    expect(img()!.getAttribute("src")).toBe(`data:image/png;base64,${btoa("fast")}`);
    resolveSlow("data:image/png;base64,STALE");
    await fixture.whenStable();
    fixture.detectChanges();
    expect(img()!.getAttribute("src")).toBe(`data:image/png;base64,${btoa("fast")}`);
  });

  it("shows no picture and logs the error when the code cannot be made", async () => {
    const logged = spyOn(console, "error");
    toDataURL.and.callFake((() => Promise.reject(new Error("too much data"))) as any);
    await render();
    expect(img()).toBeNull();
    expect(logged).toHaveBeenCalled();
  });

  it("sets the alt text only when one is given", async () => {
    await render();
    expect(img()!.hasAttribute("alt")).toBe(false);
    fixture.componentInstance.alt = "Class QR code";
    fixture.componentInstance.value = "https://example.org/again";
    await render();
    expect(img()!.getAttribute("alt")).toBe("Class QR code");
  });
});
