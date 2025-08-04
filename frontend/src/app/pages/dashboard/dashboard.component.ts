import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private router: Router) {}

  getPernr(): string {
    return localStorage.getItem('pernr') || 'Not logged in';
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }

  openLeaveRequest() {
    this.router.navigate(['/leave-request']);
  }

  openPayslip() {
    this.router.navigate(['/payslip']);
  }

  logout() {
    // Clear any stored user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('pernr');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    // Navigate to login page
    this.router.navigate(['/login']);
    
    // Optional: Show logout message in console for debugging
    console.log('User logged out successfully');
  }
}
