import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { accountError, AuthApi } from '../core/auth-api';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  email = '';
  password = '';
  message = '';
  busy = false;
  registered = false;

  constructor(
    private readonly auth: AuthApi,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.registered = this.route.snapshot.queryParamMap.get('registered') === '1';
    if (this.route.snapshot.queryParamMap.get('expired') === '1') {
      this.message = 'Your session has expired. Please log in again.';
    }
    if (this.auth.session) this.router.navigate(['/profile'], { replaceUrl: true });
  }

  async login() {
    if (this.busy) return;
    this.busy = true;
    this.message = '';
    try {
      await this.auth.login(this.email.trim(), this.password);
      this.password = '';
      await this.router.navigate(['/profile']);
    } catch (error) {
      this.message = accountError(error, 'Could not log in. Check your email and password.');
    } finally {
      this.busy = false;
      this.changeDetector.markForCheck();
    }
  }
}
