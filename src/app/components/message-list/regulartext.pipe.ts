import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'regulartext',
  standalone: true,
})
export class RegularFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    let text = value;

    // ============================================================
    // 1. Convert new lines into separate message rows
    // ============================================================
    text = text.replace(/\\n|\r\n|\r|\n/g, '</div><div class="message-line">');

    // Wrap everything in the first row
    text = `<div class="message-line">${text}</div>`;

    // ============================================================
    // 2. Convert Slack-style links
    // <url|label>
    // ============================================================
    text = text.replace(
      /<((?:https?:\/\/)[^|>]+)\|([^>]+)>/g,
      `
        <a
          href="$1"
          target="_blank"
          rel="noopener noreferrer"
          class="message-link"
        >
          $2
        </a>
      `
    );

    // ============================================================
    // 3. **bold**
    // ============================================================
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // ============================================================
    // 4. *bold*
    // ============================================================
    text = text.replace(/\*([^*\r\n]+)\*/g, '<strong>$1</strong>');

    // ============================================================
    // 5. Green emoji
    // ============================================================
    text = text.replace(/🟢/g, '<span class="buy-green">🟢</span>');

    // ============================================================
    // 6. Red emoji
    // ============================================================
    text = text.replace(/🔴/g, '<span class="sell-red">🔴</span>');

    // ============================================================
    // 7. Green bar
    // ============================================================
    text = text.replace(
      /bar_🟢_green/g,
      '<span class="bar-green">bar 🟢 green</span>'
    );

    // ============================================================
    // 8. Red bar
    // ============================================================
    text = text.replace(
      /bar_🔴_red/g,
      '<span class="bar-red">bar 🔴 red</span>'
    );

    return text;
  }
}
