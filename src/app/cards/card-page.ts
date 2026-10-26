import { LucideArrowLeft } from '@lucide/angular';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardDetails } from './card-details';

@Component({
  selector: 'app-card-page',
  imports: [RouterLink, CardDetails, LucideArrowLeft],
  template: `
    <header class="mb-6">
      <div>
        <a class="btn btn-ghost btn-sm mb-3" routerLink="/inventory"
          ><svg lucideArrowLeft [size]="16" aria-hidden="true"></svg>Back to inventory</a
        >
        <h1 class="text-3xl font-semibold">Card details</h1>
      </div>
    </header>
    <section class="card card-border bg-base-100" aria-label="Card details">
      @if (validId()) {
        <app-card-details [id]="id()" [fullPage]="true" />
      } @else {
        <div class="flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 class="text-lg font-semibold">Card not found</h2>
          <p>Choose a card from the inventory.</p>
        </div>
      }
    </section>
  `,
})
export class CardPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private subscription?: Subscription;
  protected readonly id = signal(0);
  protected readonly validId = computed(() => Number.isSafeInteger(this.id()) && this.id() > 0);

  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe((params) => {
      this.id.set(Number(params.get('id')));
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
