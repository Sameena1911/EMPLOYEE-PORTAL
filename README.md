# EMPLOYEE PORTAL

A comprehensive employee management system built with Angular frontend and Node.js backend, integrated with SAP OData services.

## Features

- **Dashboard**: Employee navigation hub with quick access to all modules
- **Profile Management**: View and manage employee profile information from SAP
- **Leave Requests**: View and track leave requests with SAP integration
- **Authentication**: Secure login with KEBS branding and employee ID validation

## Tech Stack

### Frontend
- Angular 17+ (Standalone Components)
- TypeScript
- Modern CSS with Glass Morphism design
- Responsive design for mobile and desktop

### Backend
- Node.js with Express.js
- SAP OData integration
- CORS enabled for cross-origin requests
- REST API endpoints

## Project Structure

```
EMPLOYEE PORTAL/
├── frontend/           # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── login/
│   │   │   │   ├── profile/
│   │   │   │   └── leave-re/
│   │   │   └── ...
│   │   └── assets/
│   └── ...
└── backend/            # Node.js API server
    ├── index.js        # Main server file
    ├── profile.js      # Profile API routes
    ├── leave.js        # Leave requests API routes
    └── package.json
```

## Installation & Setup

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Application will run on http://localhost:4200

### Backend Setup
```bash
cd backend
npm install
npm start
```
API server will run on http://localhost:3000

## SAP Integration

The application integrates with SAP OData services:
- **ZEMP_ODATA_SRV**: Employee authentication and profile data
- **ZEP_ODA_SRV**: Leave requests and HR data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to KEBS (Kenya Bureau of Standards).

## Contact

For support or questions, please contact the development team.
