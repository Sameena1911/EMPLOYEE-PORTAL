import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface LeaveRequest {
  Empid: string;
  StartDate: string;
  EndDate: string;
  Category: string;
  Description: string;
  Qtype: string;
  Qtime: string;
  QStart: string;
  QEnd: string;
}

@Component({
  selector: 'app-leave-re',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-re.component.html',
  styleUrls: ['./leave-re.component.css']
})
export class LeaveReComponent implements OnInit {
  leaves: LeaveRequest[] = [];
  loading: boolean = false;
  error: string = '';
  currentPernr: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    console.log('Leave Request component initialized');
    const pernr = localStorage.getItem('pernr');
    
    if (pernr) {
      this.currentPernr = pernr;
      this.loadLeaveRequests(pernr);
    } else {
      this.error = 'No personnel number found. Please login again.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  loadLeaveRequests(pernr: string): void {
    this.loading = true;
    this.error = '';
    
    console.log('Fetching leave requests for pernr:', pernr);
    
    this.http.get<any>(`http://localhost:3000/api/leaves/${pernr}`)
      .subscribe({
        next: (data) => {
          this.leaves = data.leaves || [];
          this.loading = false;
          console.log('Leave requests received:', data);
        },
        error: (err) => {
          console.error('Error fetching leave requests:', err);
          this.error = `Failed to load leave requests for employee ${pernr}. Please try again.`;
          this.loading = false;
        }
      });
  }

  formatDate(sapDate: string): string {
    if (!sapDate) return 'N/A';
    
    // Handle SAP date format /Date(timestamp)/
    if (sapDate.includes('/Date(')) {
      const timestamp = sapDate.match(/\d+/);
      if (timestamp) {
        const date = new Date(parseInt(timestamp[0]));
        return date.toLocaleDateString();
      }
    }
    
    // Handle regular date strings
    const date = new Date(sapDate);
    return date.toLocaleDateString();
  }

  formatTime(time: string): string {
    if (!time || time === '00:00:00') return 'Full Day';
    return time;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'SICK': '#ff6b6b',
      'ANNUAL': '#4dabf7',
      'PERSONAL': '#69db7c',
      'EMERGENCY': '#ff8c42',
      'MATERNITY': '#da77f2',
      'PATERNITY': '#748ffc'
    };
    return colors[category?.toUpperCase()] || '#868e96';
  }

  getStatusText(category: string): string {
    return category || 'Standard Leave';
  }

  calculateDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  }

  refreshLeaves(): void {
    if (this.currentPernr) {
      this.loadLeaveRequests(this.currentPernr);
    }
  }

  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  exportLeaves(): void {
    if (this.leaves.length > 0) {
      const dataStr = JSON.stringify(this.leaves, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leave_requests_${this.currentPernr}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }
}
