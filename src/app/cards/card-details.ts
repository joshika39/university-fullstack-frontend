import { LucideArrowUpRight } from '@lucide/angular';
import { Component, inject, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Card, CardsApi, LoadState } from '../core/cards-api';
import { CardArt } from './card-art';

@Component({
  selector: 'app-card-details',
  imports: [CardArt, RouterLink, LucideArrowUpRight],
  template: `
    @let result = state();
    @if (!result || result.status === 'loading') {
      <div
        class="flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center"
        role="status"
      >
        <span class="loading loading-spinner loading-sm"></span>Loading card…
      </div>
    } @else if (result.status === 'error') {
      <div
        class="flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center"
        role="alert"
      >
        <h2 class="text-lg font-semibold">
          {{ result.notFound ? 'Card not found' : 'Couldn’t load this card' }}
        </h2>
        <p class="text-sm text-base-content/60">
          {{
            result.notFound
              ? 'This card may no longer be in the catalogue.'
              : 'Check that the API is running and try again.'
          }}
        </p>
        <button class="btn btn-sm btn-outline" (click)="loadCard()">Try again</button>
      </div>
    } @else {
      @let card = result.data;
      <div [class]="fullPage ? 'grid gap-8 p-6 md:grid-cols-2' : 'space-y-6 p-6'">
        <div class="mx-auto w-full max-w-xs">
          <app-card-art [card]="card" />
        </div>
        <div class="space-y-6">
          <div>
            <p class="mb-2 text-xs text-base-content/60">
              CARD {{ card.id.toString().padStart(3, '0') }}
            </p>
            <h2 class="text-2xl font-semibold">{{ card.name }}</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="badge badge-outline">{{ card.rarity }}</span
            ><span class="badge badge-ghost">{{ card.element }}</span>
          </div>
          <p class="text-sm leading-relaxed">{{ card.description }}</p>
          @if (fullPage) {
            @if (card.lore) {
              <section class="space-y-3 border-t border-base-300 pt-6">
                <h3 class="font-semibold">Lore</h3>
                <p class="text-sm leading-relaxed text-base-content/70">{{ card.lore }}</p>
              </section>
            }
            <dl class="flex gap-12 border-t border-base-300 pt-6">
              <div>
                <dt class="mb-1 text-xs text-base-content/60">Rarity</dt>
                <dd class="text-sm">{{ card.rarity }}</dd>
              </div>
              <div>
                <dt class="mb-1 text-xs text-base-content/60">Element</dt>
                <dd class="text-sm">{{ card.element }}</dd>
              </div>
            </dl>
          } @else {
            <a class="btn btn-primary w-full" [routerLink]="['/cards', card.id]"
            >View full card
              <svg lucideArrowUpRight [size]="16" aria-hidden="true"></svg
              >
            </a>
          }
        </div>
      </div>
    }
  `,
})
export class CardDetails implements OnChanges, OnDestroy {
  @Input({ required: true }) id!: number;
  @Input() fullPage = false;
  protected readonly state = signal<LoadState<Card>>({ status: 'loading' });
  private readonly api = inject(CardsApi);
  private request?: Subscription;

  ngOnChanges() {
    this.loadCard();
  }

  ngOnDestroy() {
    this.request?.unsubscribe();
  }

  protected loadCard() {
    this.request?.unsubscribe();
    this.state.set({ status: 'loading' });
    this.request = this.api.getById(this.id).subscribe({
      next: (card) => this.state.set({ status: 'loaded', data: card }),
      error: (error) => this.state.set({ status: 'error', notFound: error.status === 404 }),
    });
  }
}
