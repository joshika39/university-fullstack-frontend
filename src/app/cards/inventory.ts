import { LucideSearch, LucideX } from '@lucide/angular';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Card, CardsApi, LoadState } from '../core/cards-api';
import { CardArt } from './card-art';
import { CardDetails } from './card-details';

@Component({
  selector: 'app-inventory',
  imports: [CardArt, CardDetails, LucideSearch, LucideX],
  templateUrl: './inventory.html',
  host: { '(document:keydown.escape)': 'closeDetails()' },
})
export class Inventory implements OnInit, OnDestroy {
  private readonly api = inject(CardsApi);
  private request?: Subscription;
  protected readonly state = signal<LoadState<Card[]>>({ status: 'loading' });

  ngOnInit() {
    this.loadCards();
  }

  ngOnDestroy() {
    this.request?.unsubscribe();
  }

  protected loadCards() {
    this.request?.unsubscribe();
    this.state.set({ status: 'loading' });
    this.request = this.api.getAll().subscribe({
      next: (cards) => this.state.set({ status: 'loaded', data: cards }),
      error: (error) => this.state.set({ status: 'error', notFound: error.status === 404 }),
    });
  }

  protected readonly search = signal('');
  protected readonly rarity = signal('');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  protected readonly cards = computed(() => {
    const state = this.state();
    return state?.status === 'loaded' ? state.data : [];
  });
  protected readonly filteredCards = computed(() =>
    this.cards().filter(
      (card) =>
        card.name.toLowerCase().includes(this.search().trim().toLowerCase()) &&
        (!this.rarity() || card.rarity === this.rarity()),
    ),
  );
  private trigger: HTMLElement | null = null;
  protected openDetails(id: number, event: Event) {
    this.trigger = event.currentTarget as HTMLElement;
    this.selectedId.set(id);
    setTimeout(() => document.getElementById('close-details')?.focus());
  }
  protected closeDetails() {
    if (this.selectedId() === null) return;
    this.selectedId.set(null);
    this.trigger?.focus();
  }
  protected clearFilters() {
    this.search.set('');
    this.rarity.set('');
  }
}
