import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface PayslipData {
  empId: string;
  companyCode: string;
  costCenter: string;
  stell: string;
  name: string;
  gender: string;
  nationality: string;
  pscaleGroup: string;
  psLevel: string;
  amount: number;
  wageType: string;
  currencyKey: string;
  workingHours: number;
}

@Component({
  selector: 'app-payslip',
  imports: [CommonModule, FormsModule],
  templateUrl: './payslip.component.html',
  styleUrl: './payslip.component.css'
})
export class PayslipComponent implements OnInit {
  payslipData: PayslipData[] = [];
  loading = false;
  error = '';
  employeeId = '';
  
  // Email functionality properties
  showEmailModal = false;
  emailAddress = '';
  sendingEmail = false;
  emailError = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadPayslipData();
  }

  loadPayslipData() {
    // Get employee ID from localStorage
    this.employeeId = localStorage.getItem('pernr') || '';
    
    if (!this.employeeId) {
      this.error = 'Employee ID not found. Please login again.';
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('Loading payslip data for employee:', this.employeeId);

    this.http.get<any>(`http://localhost:3000/api/payslips/payslip/${this.employeeId}`)
      .subscribe({
        next: (response) => {
          console.log('Payslip API Response:', response);
          if (response.success && response.data) {
            this.payslipData = response.data;
            console.log('Payslip data loaded:', this.payslipData);
          } else {
            this.error = response.message || 'No payslip data found';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading payslip data:', error);
          this.error = 'Failed to load payslip data. Please try again.';
          this.loading = false;
        }
      });
  }

  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      // Handle SAP date format /Date(timestamp)/
      if (dateString.includes('/Date(')) {
        const timestamp = dateString.match(/\d+/)?.[0];
        if (timestamp) {
          const date = new Date(parseInt(timestamp));
          return date.toLocaleDateString('en-GB');
        }
      }
      
      // Handle regular date strings
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  downloadPayslip(payslip: PayslipData) {
    // Use the backend endpoint to download the PDF
    const downloadUrl = `http://localhost:3000/api/payslips/download-pdf/${payslip.empId}`;
    
    console.log('Downloading payslip PDF for employee:', payslip.empId);
    console.log('Download URL:', downloadUrl);
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Payslip_${payslip.empId}.pdf`;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Alternatively, you can open in a new tab
    // window.open(downloadUrl, '_blank');
  }

  // Alternative method using HTTP client for better error handling
  downloadPayslipWithErrorHandling(payslip: PayslipData) {
    console.log('Downloading payslip PDF with error handling for employee:', payslip.empId);
    
    this.http.get(`http://localhost:3000/api/payslips/pdf-url/${payslip.empId}`)
      .subscribe({
        next: (response: any) => {
          console.log('PDF URL Response:', response);
          if (response.success && response.data.downloadEndpoint) {
            // Open the download endpoint
            window.open(`http://localhost:3000${response.data.downloadEndpoint}`, '_blank');
          } else {
            alert('Failed to get PDF download URL');
          }
        },
        error: (error) => {
          console.error('Error getting PDF URL:', error);
          alert('Failed to download payslip PDF. Please try again.');
        }
      });
  }

  // Email functionality methods
  openEmailModal(payslip: PayslipData) {
    this.showEmailModal = true;
    this.emailAddress = '';
    this.emailError = '';
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.emailAddress = '';
    this.emailError = '';
    this.sendingEmail = false;
  }

  sendPayslipEmail(payslip: PayslipData) {
    if (!this.emailAddress) {
      this.emailError = 'Please enter an email address';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.emailAddress)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.sendingEmail = true;
    this.emailError = '';

    console.log('Sending payslip email for employee:', payslip.empId, 'to:', this.emailAddress);

    const emailData = {
      email: this.emailAddress,
      employeeName: payslip.name
    };

    this.http.post(`http://localhost:3000/api/payslips/send-email/${payslip.empId}`, emailData)
      .subscribe({
        next: (response: any) => {
          console.log('Email Response:', response);
          if (response.success) {
            alert(`Payslip PDF sent successfully to ${this.emailAddress}`);
            this.closeEmailModal();
          } else {
            this.emailError = response.message || 'Failed to send email';
          }
          this.sendingEmail = false;
        },
        error: (error) => {
          console.error('Error sending email:', error);
          this.emailError = error.error?.message || 'Failed to send email. Please try again.';
          this.sendingEmail = false;
        }
      });
  }

  printPayslip() {
    window.print();
  }
}
