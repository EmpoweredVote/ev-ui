import React from 'react';
import { GovernmentBodySection, SubGroupSection, PoliticianCard } from '@empoweredvote/ev-ui';

export const Local = () => (
  <div style={{ padding: 24, maxWidth: 720, fontFamily: "'Manrope', sans-serif" }}>
    <GovernmentBodySection title="City of Bloomington" tier="local" websiteUrl="https://bloomington.in.gov">
      <SubGroupSection title="Bloomington Common Council">
        <PoliticianCard
          name="Isabel Piedmont-Smith"
          title="Council Member, District 5"
          subtitle="Common Council"
        />
        <PoliticianCard
          name="Sydney Zulich"
          title="Council Member, At-Large"
          subtitle="Common Council"
        />
      </SubGroupSection>
    </GovernmentBodySection>
  </div>
);

export const Federal = () => (
  <div style={{ padding: 24, maxWidth: 720, fontFamily: "'Manrope', sans-serif" }}>
    <GovernmentBodySection title="United States Senate" tier="federal">
      <SubGroupSection title="Indiana — Class III">
        <PoliticianCard name="Jim Banks" title="U.S. Senator" subtitle="Indiana" />
      </SubGroupSection>
    </GovernmentBodySection>
  </div>
);
