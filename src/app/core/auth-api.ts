import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './cards-api';

export interface User {
  id: string;
  userName: string;
  email: string;
}

interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly storageKey = 'card-trader-session';
  session: Session | null = this.readSession();
  private refreshing: Promise<void> | null = null;

  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string) {
    const session = await firstValueFrom(
      this.http.post<Session>(`${API_BASE_URL}/api/auth/login`, { email, password }),
    );
    this.saveSession(session);
  }

  register(userName: string, email: string, password: string) {
    return firstValueFrom(
      this.http.post<User>(`${API_BASE_URL}/api/auth/register`, { userName, email, password }),
    );
  }

  getProfile() {
    const id = encodeURIComponent(this.session?.userId ?? '');
    return this.authorized<User>('GET', `/api/users/${id}`);
  }

  async logout() {
    await this.authorized<void>('POST', '/api/auth/logout');
    this.saveSession(null);
  }

  private async authorized<T>(method: string, path: string): Promise<T> {
    if (!this.session) throw new HttpErrorResponse({ status: 401 });
    try {
      return await this.send<T>(method, path);
    } catch (error) {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) throw error;
    }

    // Only one refresh at a time, since the backend rotates refresh tokens.
    if (!this.refreshing) {
      this.refreshing = this.refreshSession().finally(() => {
        this.refreshing = null;
      });
    }
    await this.refreshing;
    try {
      return await this.send<T>(method, path);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) this.saveSession(null);
      throw error;
    }
  }

  private send<T>(method: string, path: string) {
    return firstValueFrom(
      this.http.request<T>(method, `${API_BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${this.session?.accessToken}` },
      }),
    );
  }

  private async refreshSession() {
    try {
      const session = await firstValueFrom(
        this.http.post<Session>(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken: this.session?.refreshToken,
        }),
      );
      this.saveSession(session);
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 400 || error.status === 401)) {
        this.saveSession(null);
      }
      throw error;
    }
  }

  private saveSession(session: Session | null) {
    this.session = session;
    try {
      if (session) sessionStorage.setItem(this.storageKey, JSON.stringify(session));
      else sessionStorage.removeItem(this.storageKey);
    } catch {
      // Keep working in memory if browser storage is unavailable.
    }
  }

  private readSession(): Session | null {
    try {
      const session = JSON.parse(sessionStorage.getItem(this.storageKey) ?? 'null');
      if (
        typeof session?.userId === 'string' &&
        typeof session?.accessToken === 'string' &&
        typeof session?.refreshToken === 'string'
      )
        return session;
    } catch {
      // Ignore unavailable storage or an invalid saved session.
    }
    return null;
  }
}

export function accountError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'Could not reach the server. Please try again.';
  if (error.status >= 500) return fallback;
  if (typeof error.error?.detail === 'string') return error.error.detail;
  if (error.error?.errors) return Object.values(error.error.errors).flat().join(' ');
  return fallback;
}
