// leave.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Your base SAP OData URL
const SAP_LEAVE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZEP_ODA_SRV/ZEP_LR_OSet';

router.get('/:pernr', async (req, res) => {
  const { pernr } = req.params;

  const fullUrl = `${SAP_LEAVE_URL}?$filter=Empid eq '${pernr}'`;

  try {
    const response = await axios.get(fullUrl, {
      auth: {
        username: 'K901705',
        password: 'Sameena@1911'
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const entries = response.data?.d?.results;

    const leaves = entries.map(entry => ({
      Empid: entry.Empid,
      StartDate: entry.Sdate,
      EndDate: entry.Edate,
      Category: entry.Category,
      Description: entry.Descrip,
      Qtype: entry.Qtype,
      Qtime: entry.Qtime,
      QStart: entry.QStart,
      QEnd: entry.QEnd
    }));

    res.status(200).json({ leaves });

  } catch (error) {
    console.error('Error fetching leave requests:', error.message);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});

module.exports = router;
