import { Component, Input, signal } from '@angular/core';
import { API_BASE_URL, Card } from '../core/cards-api';

@Component({
  selector: 'app-card-art',
  template: `
    <div class="aspect-3/4 overflow-hidden rounded-box bg-base-200">
      @if (imageSource(); as source) {
        <img
          class="h-full w-full object-cover"
          [src]="source"
          [alt]="card.name"
          loading="lazy"
          (error)="failedSource.set(source)"
        />
      } @else {
        <div
          class="grid h-full place-items-center p-4"
          role="img"
          [attr.aria-label]="card.name + ' — artwork unavailable'"
        >
          <span class="text-base-content/50 text-xs">Artwork unavailable</span>
        </div>
      }
    </div>
  `,
})
export class CardArt {
  @Input({ required: true }) card!: Card;
  protected readonly failedSource = signal<string | null>(null);

  protected imageSource(): string | null {
    const source = this.card.imageUrl ? new URL(this.card.imageUrl, API_BASE_URL).href : null;
    return source && source !== this.failedSource() ? source : null;
  }
}
