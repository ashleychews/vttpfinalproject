import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

const getAuthState = createFeatureSelector<AuthState>('auth');

export const isLoggedIn = createSelector(
  getAuthState,
  (state) => state.loggedIn
)

export const getCurrentUser = createSelector(
  getAuthState,
  (state) => state.user
)
