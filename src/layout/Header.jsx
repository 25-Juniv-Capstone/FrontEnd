// src/layout/Header.jsx
import React from 'react';

function Header() { 
  return (
    <header style={{
      width: '100%',
      height: '80px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0068DF' }}>Barrier Crash</div>
      <nav style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#555' }}>
        <span style={{ cursor: 'pointer' }}>커뮤니티</span>
        <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>로그인</span>
      </nav>
    </header>
  );
}

export default Header;
