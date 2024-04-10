import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { EventComponent } from './components/event/event.component';
import { SearchComponent } from './components/search/search.component';
import { CreateProfileComponent } from './components/createprofile/createprofile.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DetailsComponent } from './components/details/details.component';
import { AuthGuard } from './auth.guard';
import { ChatComponent } from './components/chat/chat.component';
import { ChatGroupComponent } from './components/chat-group/chat-group.component';
import { UserchatComponent } from './components/userchat/userchat.component';

const routes: Routes = [

  { path: '', component: HomeComponent},

  { path: 'login', component: LoginComponent},

  { path: 'register', component: SignupComponent},

  { path: 'createprofile', component: CreateProfileComponent},

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},

  { path: 'events', component: EventComponent},

  { path: 'events/:page', component: EventComponent },

  { path: 'event-details/:id', component: DetailsComponent } ,

  { path: 'search/:keyword', component: SearchComponent},

  { path: 'group', component: ChatGroupComponent, canActivate: [AuthGuard] },

  { path: 'chat/:eventId/:groupId', component: ChatComponent, canActivate: [AuthGuard] },

  { path: 'single-chat/:id', component: UserchatComponent, canActivate: [AuthGuard]},

  //wild card
  { path: '**', redirectTo: '/', pathMatch: 'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
