import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { accountError, AuthApi } from './core/auth-api';

import {
  LucideLayoutGrid,
  LucidePackageOpen,
  LucideArrowLeftRight,
  LucideGamepad2,
  LucideMenu,
  LucideUser,
  LucideLogIn,
  LucideUserPlus,
  LucideLogOut,
} from '@lucide/angular';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

type Theme = 'system' | 'light' | 'dark';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutGrid,
    LucidePackageOpen,
    LucideArrowLeftRight,
    LucideGamepad2,
    LucideMenu,
    LucideUser,
    LucideLogIn,
    LucideUserPlus,
    LucideLogOut,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly document = inject(DOCUMENT);
  protected readonly auth = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected loggingOut = false;
  protected accountMessage = '';
  protected theme: Theme = this.readTheme();
  protected menuOpen = false;

  ngOnInit() {
    this.changeTheme(this.readTheme());
  }

  protected async logout() {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.accountMessage = '';
    try {
      await this.auth.logout();
      this.menuOpen = false;
      await this.router.navigate(['/login']);
    } catch (error) {
      if (!this.auth.session) {
        this.menuOpen = false;
        await this.router.navigate(['/login']);
      } else {
        this.accountMessage = accountError(error, 'Could not log out. Please try again.');
      }
    } finally {
      this.loggingOut = false;
      this.changeDetector.markForCheck();
    }
  }

  protected changeTheme(value: string) {
    const theme: Theme = value === 'light' || value === 'dark' ? value : 'system';
    this.theme = theme;
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
