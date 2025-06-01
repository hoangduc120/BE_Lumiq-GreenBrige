const express = require('express');
const router = express.Router();
const axios = require('axios');
const Bank = require('../schema/bank.model');

// Load from .env (make sure these exist)
const CLIENT_ID = process.env.VIETQR_CLIENT_ID;
const API_KEY = process.env.VIETQR_API_KEY;

// @route   POST /api/bank/verify
// @desc    Verify bank account via VietQR
router.post('/verify', async (req, res) => {
  const { accountNo, bin } = req.body;

  if (!accountNo || !bin) {
    return res.status(400).json({ error: 'accountNo and bin are required' });
  }

  try {
    const response = await axios.post(
      'https://api.vietqr.io/v2/lookup',
      { accountNo, bin },
      {
        headers: {
          'x-client-id': CLIENT_ID,
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('VietQR API Error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to verify account',
      detail: err.response?.data || err.message,
    });
  }
});


router.get('/list', async (req, res) => {
  try {
    const banks = await Bank.find().select('shortName bin name code').lean();
    res.json(banks);
  } catch (err) {
    console.error('Error fetching banks:', err);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

module.exports = router;
