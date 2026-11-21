import React from 'react';
const Header = ({ storeDetails }) => {
    const { storeName = '', storeAddress = '', storePhone = '' } = storeDetails;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 30H32L42 78H88L98 44H36" stroke="#023535" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M52 58L62 68L80 50" stroke="#0CABA8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="50" cy="94" r="8" fill="#023535" />
                    <circle cx="84" cy="94" r="8" fill="#FFC96B" />
                </svg>
                <p style={{ color: '#015958', fontSize: '2rem', fontWeight: '600', margin: '0px' }}>CartPOS</p>
            </div>
            <p style={{ color: '#000000', margin: '0px' }}>{storeName || 'Store Name'}</p>
            <p style={{ color: '#000000', fontSize: '12px', margin: '0px' }}>{storeAddress || 'Store Address'}</p>
            <p style={{ color: '#000000', fontSize: '12px', margin: '0px' }}>Mobile: {storePhone || 'Store phone'}</p>
        </div>
    );
};

export default Header;