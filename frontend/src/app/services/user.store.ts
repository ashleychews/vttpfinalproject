import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { User, UserSlice } from "../models";

const INIT_STORE: UserSlice = {
    email: ''
}


@Injectable()
export class UserStore extends ComponentStore<UserSlice> {

    //constructor
    constructor() { super(INIT_STORE) }

    readonly setEmail = this.updater(
        (slice: UserSlice, email: string) => 
            ({ ...slice, email })
    )
    
    readonly getEmail = this.select(
        (slice: UserSlice) => slice.email
    )

}