import { Pipe, PipeTransform } from '@angular/core';
import { mappings } from './keywords.js'

@Pipe({ name: 'keyword' })
export class KeywordPipe implements PipeTransform {

    private mappings: any = mappings

    transform(value: string): string {
        let text = value
        this.mappings.forEach(e => {
            const re = new RegExp(e.text, 'ig')
            text = text.replace(re, e.tag)
        });
        return text;
    }
}