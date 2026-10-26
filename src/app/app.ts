import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import {
  LucideLayoutGrid,
  LucidePackageOpen,
  LucideArrowLeftRight,
  LucideGamepad2,
  LucideMenu,
} from '@lucide/angular';
import { RouterLink, RouterOutlet } from '@angular/router';

type Theme = 'system' | 'light' | 'dark';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    LucideLayoutGrid,
    LucidePackageOpen,
    LucideArrowLeftRight,
    LucideGamepad2,
    LucideMenu,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly document = inject(DOCUMENT);
  protected readonly theme = signal<Theme>(this.readTheme());
  protected readonly menuOpen = signal(false);

  ngOnInit() {
    this.changeTheme(this.readTheme());
  }

  protected changeTheme(value: string) {
    const theme: Theme = value === 'light' || value === 'dark' ? value : 'system';
    this.theme.set(theme);
    if (theme === 'system') {
      this.document.documentElement.removeAttribute('data-theme');
    } else {
      this.document.documentElement.setAttribute('data-theme', theme);
    }
    try {
      const storage = this.document.defaultView?.localStorage;
      if (theme === 'system') storage?.removeItem('card-trader-theme');
      else storage?.setItem('card-trader-theme', theme);
    } catch {
      // Theme switching still works when browser storage is unavailable.
    }
  }

  private readTheme(): Theme {
    try {
      const theme = this.document.defaultView?.localStorage.getItem('card-trader-theme');
      return theme === 'light' || theme === 'dark' ? theme : 'system';
    } catch {
      return 'system';
    }
  }
}
