import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
   imports: [CommonModule, FormsModule, HttpClientModule]
})
export class LoginComponent {
  userid = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.http.post<any>('http://localhost:3000/api/login', {
      userid: this.userid,
      password: this.password
    }).subscribe({
      next: res => {
        // Store the userid as pernr in localStorage for profile use
        localStorage.setItem('pernr', this.userid);
        localStorage.setItem('isLoggedIn', 'true');
        console.log('Login successful, pernr stored:', this.userid);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage = 'Invalid User ID or Password';
        console.error('Login error:', err);
      }
    });
  }
}
