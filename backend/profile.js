// profile.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your actual SAP OData URL
const SAP_BASE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZEMP_ODATA_SRV';

// Auth credentials
const SAP_AUTH = {
  username: 'K901705',
  password: 'Sameena@1911'
};

// GET profile data by Pernr
// Change from POST to GET and extract pernr from query params
router.get('/', async (req, res) => {
  const { pernr } = req.query;

  if (!pernr) {
    return res.status(400).json({ message: 'Pernr is required' });
  }

  const odataUrl = `${SAP_BASE_URL}/ZEMP_PROFILE_ODATASet?$filter=Pernr eq '${pernr}'`;

  try {
    const response = await axios.get(odataUrl, {
      auth: SAP_AUTH,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const results = response.data?.d?.results;

    if (results && results.length > 0) {
      res.status(200).json({ profile: results[0] });
    } else {
      res.status(404).json({ message: 'Profile not found for the given Pernr' });
    }

  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({ message: 'Error fetching profile from SAP backend' });
  }
});

module.exports = router;
