import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { mappings } from './keywords.js';

@Pipe({ name: 'keyword' })
export class KeywordPipe implements PipeTransform {

    private mappings: any = mappings;

    constructor(private _sanitizer: DomSanitizer) {
    }

    transform(value: string): SafeHtml {
        let text = value;
        this.mappings.forEach(e => {
            const re = new RegExp(e.text, 'ig');
            text = text.replace(re, e.tag);
        });
        return this._sanitizer.bypassSecurityTrustHtml(text);
    }
}