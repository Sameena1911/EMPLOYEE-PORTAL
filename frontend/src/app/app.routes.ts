import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LeaveReComponent } from './pages/leave-re/leave-re.component';
import { PayslipComponent } from './pages/payslip/payslip.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'leave-request', component: LeaveReComponent },
  { path: 'payslip', component: PayslipComponent },
  { path: '**', redirectTo: '/login' } // Wildcard route for 404 pages
];
