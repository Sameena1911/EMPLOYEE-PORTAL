const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

// SAP OData service configuration
const SAP_BASE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPAYSLIP_EP_SRV';
const SAP_USERNAME = 'K901705';
const SAP_PASSWORD = 'Sameena@1911';

// Email configuration
// Note: For Gmail, you need to use an App Password instead of your regular password
// Go to Google Account Settings > Security > 2-Step Verification > App passwords to generate one
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'feroz8955@gmail.com',
    pass: 'zjju fgxr alhx bhhv' // App Password from Google
  }
};

// Create nodemailer transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Get payslip data for an employee
router.get('/payslip/:pernr', async (req, res) => {
  try {
    const { pernr } = req.params;
    console.log('Fetching payslip data for employee:', pernr);
    
    // Format employee ID to ensure it's 8 digits with leading zeros
    const formattedEmpId = pernr.padStart(8, '0');
    
    const url = `${SAP_BASE_URL}/ZPDF_PAYSLIPSet?$filter=EmpId eq '${formattedEmpId}'&$format=json`;
    console.log('SAP URL:', url);
    
    const response = await axios.get(url, {
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('SAP Response Status:', response.status);
    console.log('SAP Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.d && response.data.d.results) {
      const payslipData = response.data.d.results;
      
      if (payslipData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No payslip data found for this employee',
          data: []
        });
      }
      
      // Process and format the payslip data
      const formattedPayslips = payslipData.map(payslip => ({
        empId: payslip.EmpId,
        companyCode: payslip.CompanyCode,
        costCenter: payslip.CostCenter,
        stell: payslip.Stell,
        name: payslip.Name,
        gender: payslip.Gender,
        nationality: payslip.Nationality,
        pscaleGroup: payslip.PscaleGroup,
        psLevel: payslip.PsLevel,
        amount: parseFloat(payslip.Amount || 0),
        wageType: payslip.WageType,
        currencyKey: payslip.CurrencyKey || 'EUR',
        workingHours: parseFloat(payslip.WorkingHours || 0)
      }));
      
      res.json({
        success: true,
        message: 'Payslip data retrieved successfully',
        data: formattedPayslips
      });
      
    } else {
      console.error('Unexpected SAP response structure:', response.data);
      res.status(500).json({
        success: false,
        message: 'Unexpected response format from SAP system',
        data: []
      });
    }
    
  } catch (error) {
    console.error('Error fetching payslip data:', error.message);
    
    if (error.response) {
      console.error('SAP Error Response:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        success: false,
        message: `SAP system error: ${error.response.status}`,
        error: error.response.data
      });
    } else if (error.request) {
      console.error('Network Error:', error.request);
      res.status(503).json({
        success: false,
        message: 'Unable to connect to SAP system',
        error: 'Network timeout or connection refused'
      });
    } else {
      console.error('General Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
});

// Get all payslips (for admin/HR use)
router.get('/payslips', async (req, res) => {
  try {
    console.log('Fetching all payslip data');
    
    const url = `${SAP_BASE_URL}/ZPDF_PAYSLIPSet?$format=json`;
    console.log('SAP URL:', url);
    
    const response = await axios.get(url, {
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    if (response.data && response.data.d && response.data.d.results) {
      const payslipData = response.data.d.results;
      
      const formattedPayslips = payslipData.map(payslip => ({
        empId: payslip.EmpId,
        name: payslip.Name,
        amount: parseFloat(payslip.Amount || 0),
        wageType: payslip.WageType,
        currencyKey: payslip.CurrencyKey || 'EUR',
        workingHours: parseFloat(payslip.WorkingHours || 0)
      }));
      
      res.json({
        success: true,
        message: 'All payslip data retrieved successfully',
        data: formattedPayslips
      });
      
    } else {
      res.status(500).json({
        success: false,
        message: 'Unexpected response format from SAP system',
        data: []
      });
    }
    
  } catch (error) {
    console.error('Error fetching all payslip data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payslip data',
      error: error.message
    });
  }
});

// Download payslip PDF for an employee
router.get('/download-pdf/:pernr', async (req, res) => {
  try {
    const { pernr } = req.params;
    console.log('Downloading payslip PDF for employee:', pernr);
    
    // Format employee ID to ensure it's 8 digits with leading zeros
    const formattedEmpId = pernr.padStart(8, '0');
    
    const url = `${SAP_BASE_URL}/zdown_pdfSet('${formattedEmpId}')/$value`;
    console.log('SAP PDF URL:', url);
    
    const response = await axios.get(url, {
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/pdf'
      },
      responseType: 'arraybuffer', // Use arraybuffer for better binary handling
      timeout: 60000 // 60 seconds timeout for PDF download
    });
    
    console.log('SAP PDF Response Status:', response.status);
    console.log('SAP PDF Response Headers:', response.headers);
    console.log('PDF Size:', response.data.byteLength, 'bytes');
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payslip_${formattedEmpId}.pdf"`);
    res.setHeader('Content-Length', response.data.byteLength);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    // Send the PDF buffer directly
    res.send(Buffer.from(response.data));
    
  } catch (error) {
    console.error('Error downloading payslip PDF:', error.message);
    
    if (error.response) {
      console.error('SAP PDF Error Response:', error.response.status, error.response.statusText);
      
      if (error.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Payslip PDF not found for this employee',
          error: 'PDF not available'
        });
      }
      
      res.status(error.response.status).json({
        success: false,
        message: `SAP system error: ${error.response.status}`,
        error: error.response.statusText || 'PDF download failed'
      });
    } else if (error.request) {
      console.error('Network Error:', error.request);
      res.status(503).json({
        success: false,
        message: 'Unable to connect to SAP system for PDF download',
        error: 'Network timeout or connection refused'
      });
    } else {
      console.error('General PDF Download Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error during PDF download',
        error: error.message
      });
    }
  }
});

// Get payslip PDF download URL (alternative method)
router.get('/pdf-url/:pernr', async (req, res) => {
  try {
    const { pernr } = req.params;
    console.log('Getting PDF URL for employee:', pernr);
    
    // Format employee ID to ensure it's 8 digits with leading zeros
    const formattedEmpId = pernr.padStart(8, '0');
    
    // Return the direct download URL for the frontend to use
    const pdfUrl = `${SAP_BASE_URL}/zdown_pdfSet('${formattedEmpId}')/$value`;
    
    res.json({
      success: true,
      message: 'PDF download URL generated successfully',
      data: {
        empId: formattedEmpId,
        pdfUrl: pdfUrl,
        downloadEndpoint: `/api/payslips/download-pdf/${pernr}`
      }
    });
    
  } catch (error) {
    console.error('Error generating PDF URL:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF URL',
      error: error.message
    });
  }
});

// Send payslip PDF via email
router.post('/send-email/:pernr', async (req, res) => {
  try {
    const { pernr } = req.params;
    const { email, employeeName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        error: 'Missing email parameter'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Please enter a valid email address'
      });
    }

    console.log('Sending payslip PDF via email for employee:', pernr, 'to:', email);
    
    // Format employee ID to ensure it's 8 digits with leading zeros
    const formattedEmpId = pernr.padStart(8, '0');
    
    // Get PDF from SAP
    const url = `${SAP_BASE_URL}/zdown_pdfSet('${formattedEmpId}')/$value`;
    console.log('SAP PDF URL for email:', url);
    
    const response = await axios.get(url, {
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/pdf'
      },
      responseType: 'arraybuffer', // Use arraybuffer for better PDF handling
      timeout: 60000
    });
    
    console.log('PDF retrieved successfully, size:', response.data.byteLength, 'bytes');
    
    // Convert arraybuffer to buffer for email attachment
    const pdfBuffer = Buffer.from(response.data);
    
    // Prepare email options
    const mailOptions = {
      from: {
        name: 'KEBS Employee Portal',
        address: 'feroz8955@gmail.com'
      },
      to: email,
      subject: `Payslip - Employee ID: ${formattedEmpId}${employeeName ? ` - ${employeeName}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">KEBS Employee Portal</h1>
            <p style="color: white; margin: 10px 0 0 0;">Payslip Document</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${employeeName || 'Employee'},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Please find your payslip document attached to this email.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Payslip Details:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Employee ID:</strong> ${formattedEmpId}</li>
                <li><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-GB')}</li>
                <li><strong>Document Type:</strong> PDF</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Important Notes:</strong>
            </p>
            <ul style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              <li>This document is confidential and intended only for the recipient</li>
              <li>Please keep this document secure for your records</li>
              <li>Contact HR department for any queries regarding your payslip</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #888; font-size: 14px;">
                This is an automated email from KEBS Employee Portal.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Kenya Bureau of Standards (KEBS)<br>
              In Pursuit of Excellence
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Payslip_${formattedEmpId}_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    // Send email
    console.log('Sending email...');
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', emailResult.messageId);
    
    res.json({
      success: true,
      message: 'Payslip PDF sent successfully via email',
      data: {
        empId: formattedEmpId,
        email: email,
        messageId: emailResult.messageId,
        sentAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error sending payslip PDF via email:', error.message);
    
    if (error.response) {
      console.error('SAP Error Response:', error.response.status, error.response.statusText);
      res.status(error.response.status).json({
        success: false,
        message: `Failed to retrieve PDF from SAP: ${error.response.status}`,
        error: error.response.statusText || 'PDF retrieval failed'
      });
    } else if (error.code === 'EAUTH') {
      console.error('Email Authentication Error:', error);
      res.status(500).json({
        success: false,
        message: 'Email authentication failed',
        error: 'Unable to authenticate with email service'
      });
    } else if (error.code === 'ECONNECTION') {
      console.error('Email Connection Error:', error);
      res.status(500).json({
        success: false,
        message: 'Email service connection failed',
        error: 'Unable to connect to email service'
      });
    } else {
      console.error('General Email Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: error.message
      });
    }
  }
});

module.exports = router;
