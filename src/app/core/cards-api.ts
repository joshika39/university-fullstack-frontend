import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export const API_BASE_URL = 'http://localhost:5062';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type Element = 'Neutral' | 'Water' | 'Earth' | 'Fire' | 'Air' | 'Light' | 'Dark';

export interface Card {
  id: number;
  name: string;
  rarity: Rarity;
  element: Element;
  description: string;
  lore: string | null;
  imageUrl: string;
}

export type LoadState<T> =
  { status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; notFound: boolean };

@Injectable({ providedIn: 'root' })
export class CardsApi {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<Card[]>(`${API_BASE_URL}/api/cards`);
  }
  getById(id: number) {
    return this.http.get<Card>(`${API_BASE_URL}/api/cards/${id}`);
  }
}
