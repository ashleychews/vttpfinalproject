// auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../../models';

export interface AuthState {
  loggedIn: boolean;
  user: User | null;
}

export const initialState: AuthState = {
  loggedIn: false,
  user: null,
}

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state, { user }) => ({
    ...state,
    loggedIn: true,
    user,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    loggedIn: false,
    user: null,
  }))
)
