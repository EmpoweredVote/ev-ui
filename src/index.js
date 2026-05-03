// Components
export { default as RadarChartCore } from "./RadarChartCore.jsx";
export { default as Header } from "./Header.jsx";
export { default as SiteHeader, defaultNavItems, defaultCtaButton } from "./SiteHeader.jsx";
export { default as FilterSidebar } from "./FilterSidebar.jsx";
export { default as PoliticianCard } from "./PoliticianCard.jsx";
export { default as CompassCardHorizontal } from "./CompassCardHorizontal.jsx";
export { default as CompassCardVertical } from "./CompassCardVertical.jsx";
export { default as CompassKey } from "./CompassKey.jsx";
export { default as IconOverlay } from "./IconOverlay.jsx";
export { default as CategorySection } from "./CategorySection.jsx";
export { default as SubGroupSection } from "./SubGroupSection.jsx";
export { default as GovernmentBodySection } from "./GovernmentBodySection.jsx";
export { default as SocialLinks } from "./SocialLinks.jsx";
export { default as IssueTags } from "./IssueTags.jsx";
export { default as CommitteeTable } from "./CommitteeTable.jsx";
export { default as PoliticianProfile } from "./PoliticianProfile.jsx";
export { default as LegislativeInlineSummary } from "./LegislativeInlineSummary.jsx";
export { default as LegislativeRecord } from "./LegislativeRecord.jsx";
export { default as JudicialScorecard } from "./JudicialScorecard.jsx";
export { JudicialRecordDetail } from "./JudicialRecordDetail.jsx";
export { default as AuthForm } from "./AuthForm.jsx";
export { default as TopicTierBadge } from "./TopicTierBadge.jsx";
export { default as CompassCoverageCallout } from "./CompassCoverageCallout.jsx";
export { default as ExpandCompassNudge } from "./ExpandCompassNudge.jsx";
export { computeTierCoverage } from "./computeTierCoverage.js";

// Hooks
export { default as useMediaQuery } from "./useMediaQuery.js";

// Cross-subdomain shared client state (guest + authed users)
// evContext exposes get/set/clear/subscribe (guest slice) plus
// getAuthedSlice/setAuthedSlice/clearAuthedSlice for userId-stamped authed mirror.
export { evContext } from "./evContext.js";

// 260426-mw6 — guest → authed promotion hook
export { useEvContextPromotion } from "./useEvContextPromotion.js";

// Design Tokens
export * from "./tokens.js";

// Profile Components
export { default as StanceAccordion } from "./StanceAccordion.jsx";

// Icons
export { BallotIcon, CompassIcon, BranchIcon } from './icons.js';

// Feedback
export { default as FeedbackButton } from './FeedbackButton.jsx';
