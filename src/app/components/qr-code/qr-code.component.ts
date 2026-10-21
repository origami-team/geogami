import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import QRCode, { QRCodeErrorCorrectionLevel } from 'qrcode';

// <app-qr-code [value]="link" cssClass="class-qr-code" [width]="600" errorCorrectionLevel="M">
//
// Shows a QR code for `value` as <div class="{cssClass}"><img src="data:image/png…"></div>.
// The img must stay a direct child of that div: the global styles (`.qr-code > img`,
// `.class-qr-code > img`) and the PDF export (`.class-qr-code img`) rely on it.
//
// Replaces the component of @techiediaries/ngx-qrcode, which is a thin wrapper around
// QRCode.toDataURL and was never compiled for newer Angular versions. The defaults are the
// ones it used, so the pictures are unchanged. One deliberate difference: when `value`
// becomes empty the picture is removed, instead of leaving the QR of the previous value
// on screen.
@Component({
  selector: 'app-qr-code',
  template: `<div [class]="cssClass"><img *ngIf="src" [src]="src" [attr.alt]="alt || null" /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeComponent implements OnChanges {
  @Input() value = '';
  @Input() cssClass = 'qrcode';
  @Input() errorCorrectionLevel: QRCodeErrorCorrectionLevel = 'M';
  @Input() width = 10;
  @Input() margin = 4;
  @Input() scale = 4;
  @Input() colorDark = '#000';
  @Input() colorLight = '#FFF';
  @Input() alt?: string;

  src = '';

  // Only the newest request may update the picture (an older, slower one must not overwrite it).
  private latest = 0;

  constructor(private changeDetector: ChangeDetectorRef) {}

  async ngOnChanges() {
    const request = ++this.latest;
    if (!this.value) {
      this.src = '';
      return;
    }
    try {
      const src = await QRCode.toDataURL(this.value, {
        errorCorrectionLevel: this.errorCorrectionLevel,
        margin: this.margin,
        scale: this.scale,
        width: this.width,
        color: { dark: this.colorDark, light: this.colorLight },
      });
      if (request === this.latest) {
        this.src = src;
        this.changeDetector.markForCheck();
      }
    } catch (error) {
      if (request === this.latest) {
        this.src = '';
        this.changeDetector.markForCheck();
      }
      console.error(error);
    }
  }
}
