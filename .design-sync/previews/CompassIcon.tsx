import React from 'react';
import { CompassIcon } from '@empoweredvote/ev-ui';

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#00657C', padding: 20 }}>
    <CompassIcon size={48} />
    <CompassIcon size={32} />
    <CompassIcon size={24} />
    <CompassIcon size={16} />
  </div>
);

export const Colors = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: 20 }}>
    <CompassIcon size={36} color="#00657C" />
    <CompassIcon size={36} color="#FF5740" />
    <CompassIcon size={36} color="#6B7280" />
  </div>
);
