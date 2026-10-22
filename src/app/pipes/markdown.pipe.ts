import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

// Same normalisation ngx-markdown applied before parsing (ngx-markdown 10's
// `trimIndentation`, kept line for line): a text that is indented as a whole,
// e.g. pasted from a document, would otherwise be turned into a code block,
// because markdown treats four leading spaces as code. Every line loses
// min(its own indentation, the indentation of the first non-empty line).
export function trimIndentation(markdown: string): string {
  if (!markdown) {
    return '';
  }
  let indentStart: number | undefined;
  return markdown
    .split('\n')
    .map((line) => {
      let lineIndentStart = indentStart;
      if (line.length > 0) {
        lineIndentStart =
          lineIndentStart === undefined
            ? line.search(/\S|$/)
            : Math.min(line.search(/\S|$/), lineIndentStart);
      }
      if (indentStart === undefined) {
        indentStart = lineIndentStart;
      }
      return lineIndentStart ? line.substring(lineIndentStart) : line;
    })
    .join('\n');
}

// Renders the markdown a game author wrote (e.g. the task text) as HTML.
//
// The result is passed through Angular's HTML sanitizer, so scripts, event
// handlers, `javascript:` links and unknown tags (e.g. <ion-*>) typed by an
// author are removed before the text reaches a player. It returns a plain
// (sanitized) string, so it can be piped into `keyword`, which adds its own
// markup afterwards, or bound to [innerHTML] directly.
//
// This replaces ngx-markdown, whose newer releases pull in mermaid, KaTeX,
// Prism and ~65 other packages that this app never used.
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): string {
    if (value == null) {
      return '';
    }
    const text = typeof value === 'string' ? value : String(value);
    const html = marked.parse(trimIndentation(text));
    return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
  }
}
