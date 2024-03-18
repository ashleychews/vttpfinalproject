import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { EventComponent } from './components/event/event.component';
import { SearchComponent } from './components/search/search.component';
import { CreateProfileComponent } from './components/createprofile/createprofile.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [

  { path: '', component: HomeComponent},

  { path: 'login', component: LoginComponent},

  { path: 'register', component: SignupComponent},

  { path: 'createprofile', component: CreateProfileComponent},

  { path: 'profile', component: ProfileComponent},

  { path: 'events', component: EventComponent},

  { path: 'search/:keyword', component: SearchComponent},

  //wild card
  { path: '**', redirectTo: '/', pathMatch: 'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
