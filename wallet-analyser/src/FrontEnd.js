import React, { useState } from 'react';
import axios from 'axios';

function WalletPerformance() {
    const [currentWalletAddress, setCurrentWalletAddress] = useState('');
    const [currentTag, setCurrentTag] = useState('');
    const [walletAddresses, setWalletAddresses] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const decimalPlaces = (num) => {
        return Math.round(num * 100) / 100;
    };

    const addWalletAddress = async () => {
        if (currentWalletAddress.trim() !== '' && walletAddresses.length < 10) {
            const trimmedAddress = currentWalletAddress.trim();
            const trimmedTag = currentTag.trim() || 'No Tag'; // Default to 'No Tag' if no tag is provided
            setWalletAddresses([...walletAddresses, { address: trimmedAddress, tag: trimmedTag }]);
            setCurrentWalletAddress(''); // Clear wallet address input field after adding
            setCurrentTag(''); // Clear tag input field after adding
            
            try {
                const response = await axios.post('http://localhost:3001/api/wallet-performance', { walletAddress: trimmedAddress });
                setPerformanceData(prevData => [
                    ...prevData,
                    { walletAddress: trimmedAddress, tag: trimmedTag, data: response.data.data }
                ]);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch wallet performance data.');
            }
        } else if (walletAddresses.length >= 10) {
            setError('You can only add up to 10 wallet addresses.');
        }
    };

    const clearAddresses = () => {
        setWalletAddresses([]);
        setPerformanceData([]);
        setError(null);
    };

    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        
        const sortedData = [...performanceData].sort((a, b) => {
            if (!a.data || !b.data) return 0; // Handle cases where data might be missing

            if (key === 'winrate') {
                const aValue = a.data.winrate;
                const bValue = b.data.winrate;
                return direction === 'ascending' ? aValue - bValue : bValue - aValue;
            } else if (key === 'realized_profit_7d') {
                const aValue = a.data.realized_profit_7d;
                const bValue = b.data.realized_profit_7d;
                return direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        setPerformanceData(sortedData);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>Wallet Performance</h1>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={currentWalletAddress}
                    onChange={(e) => setCurrentWalletAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    style={{ width: '300px', marginRight: '10px' }}
                />
                <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Enter tag (optional)"
                    style={{ width: '150px', marginRight: '10px' }}
                />
                <button onClick={addWalletAddress}>Add Wallet Address</button>
            </div>

            {walletAddresses.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button onClick={clearAddresses}>Clear Addresses</button>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {performanceData.length > 0 && (
                <div>
                    <h2>Results</h2>
                    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Wallet Address</th>
                                <th>Tag</th>
                                <th>
                                    Winrate (%) 
                                    <button onClick={() => sortData('winrate')} style={{ marginLeft: '5px' }}>
                                        {sortConfig.key === 'winrate' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↕'}
                                    </button>
                                </th>
                                <th>
                                    Last 7 Day Profit or Loss ($) 
                                    <button onClick={() => sortData('realized_profit_7d')} style={{ marginLeft: '5px' }}>
                                        {sortConfig.key === 'realized_profit_7d' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↕'}
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.map(({ walletAddress, tag, data }) => (
                                <tr key={walletAddress}>
                                    <td>{walletAddress}</td>
                                    <td>{tag}</td>
                                    <td>{data ? `${decimalPlaces(data.winrate * 100)}%` : 'N/A'}</td>
                                    <td>{data ? `$${decimalPlaces(data.realized_profit_7d)}` : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default WalletPerformance;
