import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions, private userService: UserService, private router: Router, private snackBar: MatSnackBar) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap(({ user }) =>
                this.userService.login(user).then(
                    (response) => {
                        // Dispatch success action if login succeeds
                        this.snackBar.open('Login successful!', 'Dismiss', { duration: 3000 }) // Display success message
                        this.router.navigate(['/profile']); // Navigate to profile after successful login
                        return AuthActions.loginSuccess({ user: response })
                    },
                    (error) => {
                        // Dispatch failure action if login fails
                        this.snackBar.open('Email or password is incorrect.', 'Dismiss', { duration: 5000 }) // Display error message
                        return AuthActions.loginFailure({ error: 'Email or password is incorrect.' })
                    }
                )
            )
        )
    )

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            tap(() => {
                this.snackBar.open('Signing out! Bye', 'Dismiss', { duration: 3000 }) // Display logout message
                // navigate back to login page
                this.router.navigate(['/login'])
            })
        ),
        { dispatch: false } // Don't dispatch further actions after logout
    )


}
