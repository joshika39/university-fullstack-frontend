import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { accountError, AuthApi } from '../core/auth-api';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register implements OnInit {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  busy = false;

  constructor(
    private readonly auth: AuthApi,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.auth.session) this.router.navigate(['/profile'], { replaceUrl: true });
  }

  async register() {
    if (this.busy) return;
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    this.busy = true;
    this.message = '';
    try {
      await this.auth.register(this.username.trim(), this.email.trim(), this.password);
      this.password = '';
      this.confirmPassword = '';
      await this.router.navigate(['/login'], { queryParams: { registered: '1' } });
    } catch (error) {
      this.message = accountError(error, 'Could not create your account. Please try again.');
    } finally {
      this.busy = false;
      this.changeDetector.markForCheck();
    }
  }
}
