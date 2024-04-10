import { createAction, props } from '@ngrx/store';
import { User } from '../../models';

// Action to initiate the login process
export const login = createAction('[Auth] Login', props<{ user: User }>())

// Action to logout the user
export const logout = createAction('[Auth] Logout')

// Action dispatched upon successful login
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User }>())

// Action dispatched upon login failure
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>())
