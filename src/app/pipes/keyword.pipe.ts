import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { mappings } from './keywords.js';

@Pipe({ name: 'keyword' })
export class KeywordPipe implements PipeTransform {

    private mappings: any = mappings;

    constructor(private _sanitizer: DomSanitizer) {
    }

    // Takes the HTML produced by the `markdown` pipe: a plain string up to
    // ngx-markdown 13, an already sanitized SafeHtml from ngx-markdown 14 on.
    // Unwrapping a SafeHtml with sanitize() returns its string unchanged.
    transform(value: string | SafeHtml): SafeHtml {
        let text =
            typeof value === 'string'
                ? value
                : this._sanitizer.sanitize(SecurityContext.HTML, value) || '';
        this.mappings.forEach(e => {
            const re = new RegExp(e.text, 'ig');
            text = text.replace(re, e.tag);
        });
        return this._sanitizer.bypassSecurityTrustHtml(text);
    }
}
