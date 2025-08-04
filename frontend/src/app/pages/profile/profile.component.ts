// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  employee: any;
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    console.log('Profile component initialized');
    const pernr = localStorage.getItem('pernr'); // Saved during login
    console.log('Retrieved pernr from localStorage:', pernr);
    
    if (pernr) {
      console.log('Making API call to profile endpoint for pernr:', pernr);
      this.http.get<any>(`http://localhost:3000/api/profile?pernr=${pernr}`)
        .subscribe({
          next: (data) => {
            this.employee = data;
            this.error = ''; // Clear any previous errors
            console.log('Profile data received for pernr', pernr, ':', data);
          },
          error: (err) => {
            console.error('Error fetching profile for pernr', pernr, ':', err);
            this.error = `Failed to load profile data for employee ${pernr}. Please check your connection and try again.`;
            this.employee = null;
          }
        });
    } else {
      console.log('No pernr found in localStorage - user needs to login');
      this.error = 'No personnel number found. Please login again.';
      this.employee = null;
      // Redirect to login after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  // Helper methods for data formatting
  getInitials(firstName: string, lastName: string): string {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'N/A';
  }

  formatBirthDate(sapDate: string): string {
    if (!sapDate) return 'N/A';
    // SAP date format: /Date(timestamp)/
    if (sapDate.includes('/Date(')) {
      const timestamp = sapDate.match(/\d+/);
      if (timestamp) {
        const date = new Date(parseInt(timestamp[0]));
        return date.toLocaleDateString();
      }
    }
    return sapDate;
  }

  formatSapDate(sapDate: string): string {
    if (!sapDate) return 'N/A';
    // SAP date format: /Date(timestamp)/
    if (sapDate.includes('/Date(')) {
      const timestamp = sapDate.match(/\d+/);
      if (timestamp) {
        const date = new Date(parseInt(timestamp[0]));
        return date.toLocaleDateString();
      }
    }
    return sapDate;
  }

  getGenderText(gender: string): string {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      default: return gender || 'Not specified';
    }
  }

  getNationalityText(nationality: string): string {
    // You can expand this with more nationality codes
    const nationalities: { [key: string]: string } = {
      'IN': 'Indian',
      'US': 'American',
      'GB': 'British',
      'DE': 'German',
      // Add more as needed
    };
    return nationalities[nationality] || nationality || 'Not specified';
  }

  getLanguageText(language: string): string {
    // You can expand this with more language codes
    const languages: { [key: string]: string } = {
      'EN': 'English',
      'DE': 'German',
      'FR': 'French',
      'ES': 'Spanish',
      'HI': 'Hindi',
      // Add more as needed
    };
    return languages[language] || language || 'Not specified';
  }

  getCountryText(country: string): string {
    // You can expand this with more country codes
    const countries: { [key: string]: string } = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      // Add more as needed
    };
    return countries[country] || country || 'Not specified';
  }

  getEmploymentStatus(startDate: string, endDate: string): string {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && start > now) return 'Future Employee';
    if (end && end < now) return 'Former Employee';
    return 'Active Employee';
  }

  refreshProfile(): void {
    this.error = '';
    this.employee = null;
    this.ngOnInit();
  }

  exportProfile(): void {
    if (this.employee && this.employee.profile) {
      const dataStr = JSON.stringify(this.employee.profile, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile_${this.employee.profile.Pernr}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
