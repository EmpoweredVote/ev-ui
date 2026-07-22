import React from 'react';
import { BallotIcon } from '@empoweredvote/ev-ui';

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#00657C', padding: 20 }}>
    <BallotIcon size={48} />
    <BallotIcon size={32} />
    <BallotIcon size={24} />
    <BallotIcon size={16} />
  </div>
);

export const Colors = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: 20 }}>
    <BallotIcon size={36} color="#00657C" />
    <BallotIcon size={36} color="#FF5740" />
    <BallotIcon size={36} color="#6B7280" />
  </div>
);
