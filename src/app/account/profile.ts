import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { accountError, AuthApi, User } from '../core/auth-api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  user: User | null = null;
  loading = true;
  message = '';

  constructor(
    private readonly auth: AuthApi,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    if (!this.auth.session) {
      await this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    this.loading = true;
    this.user = null;
    this.message = '';
    try {
      this.user = await this.auth.getProfile();
    } catch (error) {
      if (!this.auth.session) {
        await this.router.navigate(['/login'], { queryParams: { expired: '1' }, replaceUrl: true });
      } else {
        this.message = accountError(error, 'Could not load your profile. Please try again.');
      }
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }
}
