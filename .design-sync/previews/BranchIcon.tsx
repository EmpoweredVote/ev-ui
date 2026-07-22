import React from 'react';
import { BranchIcon } from '@empoweredvote/ev-ui';

const cell: React.CSSProperties = { textAlign: 'center', color: '#00657C' };
const label: React.CSSProperties = { fontSize: 12, color: '#535964', fontFamily: "'Manrope', sans-serif", marginTop: 6 };

export const Branches = () => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: 20 }}>
    <div style={cell}><BranchIcon size={40} branch="executive" /><div style={label}>Executive</div></div>
    <div style={cell}><BranchIcon size={40} branch="legislative" /><div style={label}>Legislative</div></div>
    <div style={cell}><BranchIcon size={40} branch="judicial" /><div style={label}>Judicial</div></div>
    <div style={cell}><BranchIcon size={40} /><div style={label}>Default</div></div>
  </div>
);
