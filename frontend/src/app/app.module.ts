import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MaterialModuleModule } from './material/material.module';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { EventComponent } from './components/event/event.component';
import { EventService } from './services/event.service';
import { UserService } from './services/user.service';
import { DatePipe } from '@angular/common';
import { SearchComponent } from './components/search/search.component';
import { DetailsComponent } from './components/details/details.component';
import { CreateProfileComponent } from './components/createprofile/createprofile.component';
import { UserStore } from './services/user.store';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    EventComponent,
    SearchComponent,
    DetailsComponent,
    CreateProfileComponent,
    AuthenticationComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModuleModule
  ],
  providers: [
    provideAnimationsAsync(),
    EventService,
    UserService,
    UserStore,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
