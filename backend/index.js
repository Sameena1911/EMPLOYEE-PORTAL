const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/login', async (req, res) => {
  const { userid, password } = req.body;

  try {
    const odataUrl = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZEMP_ODATA_SRV/ZEMP_ODATA_SERVICESet(Pernr='${userid}',Password='${password}')`;
    

    const response = await axios.get(odataUrl, {
      auth: {
        username: 'K901705',
        password: 'Sameena@1911'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const status = response.data?.d?.Status;

    if (status === 'S') {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});
// 🔁 Profile route import
const profileRoute = require('./profile');
app.use('/api/profile', profileRoute);

// 🆕 Leave route import
const leaveRoute = require('./leave');
app.use('/api/leaves', leaveRoute);

// 🆕 Payslip route import
const payslipRoute = require('./payslip');
app.use('/api/payslips', payslipRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
