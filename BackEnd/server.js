const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Root URL handler to confirm the server is running
app.get('/', (req, res) => {
    res.send('Server is running. Use API endpoints to interact.');
});

// Endpoint to handle POST requests for wallet performance
app.post('/api/wallet-performance', async (req, res) => {
    const { walletAddress } = req.body;

    try {
        const performanceData = await getWalletPerformance(walletAddress);
        res.json(performanceData);
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        res.status(500).json({ error: 'Failed to fetch wallet data' });
    }
});

// Function to perform API request to an external service
async function getWalletPerformance(walletAddress) {
    const baseUrl = `https://gmgn.ai/defi/quotation/v1/smartmoney/sol/walletNew/${walletAddress}?period=7d`;
    
    try {
        const response = await axios.get(baseUrl); // Removed the headers as no API key is needed
        return response.data;
    } catch (error) {
        console.error('API request error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Starting the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
