import React, { useState, useEffect } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';
import useMediaQuery from './useMediaQuery';
import SocialLinks from './SocialLinks.jsx';
import CommitteeTable from './CommitteeTable.jsx';
import LegislativeInlineSummary from './LegislativeInlineSummary.jsx';
import JudicialScorecard from './JudicialScorecard.jsx';

// ── Helpers ──────────────────────────────────────────────────────────

function formatTermDate(dateStr, precision) {
  if (!dateStr) return null;
  if (precision === 'year') {
    const year = parseInt(dateStr, 10);
    if (!isNaN(year) && year > 1900 && year < 2100) return String(year);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getTermLine(pol) {
  const precision = pol.term_date_precision;
  const start = formatTermDate(pol.term_start, precision);
  if (!start) return null;
  const end = formatTermDate(pol.term_end, precision);
  if (!end) return `Since ${start}`;
  return `${start} \u2013 ${end}`;
}

function stripRetain(s) {
  return (s || '').replace(/\s*\(Retain\s+.+?\?\)/, '');
}

function qualifyLocalTitle(baseTitle, pol) {
  if (!pol.government_name || !baseTitle) return baseTitle;
  const dt = pol.district_type || '';
  if (!dt.startsWith('LOCAL') && dt !== 'COUNTY') return baseTitle;
  const gov = pol.government_name.split(',')[0].trim();
  const govCore = gov.replace(/^City of\s+/i, '').replace(/\s+County$/i, '').trim();
  if (govCore && baseTitle.toLowerCase().includes(govCore.toLowerCase())) return baseTitle;
  let prefix = dt === 'COUNTY' ? gov : gov.replace(/^City of\s+/i, '');
  if (prefix.endsWith('County') && baseTitle.startsWith('County'))
    prefix = prefix.replace(/\s+County$/, '');
  return `${prefix} ${baseTitle}`;
}

function buildTitleAndSubtitle(pol) {
  const cleanTitle = stripRetain(pol.office_title);
  const cleanChamber = stripRetain(pol.chamber_name);
  const dashIdx = cleanTitle.lastIndexOf(' - ');

  const title = (() => {
    if (dashIdx > 0) return qualifyLocalTitle(cleanTitle.slice(0, dashIdx), pol);
    // NATIONAL_JUDICIAL: show role as title (e.g. "Chief Justice"), chamber as subtitle
    if (pol.district_type === 'NATIONAL_JUDICIAL')
      return cleanTitle || cleanChamber;
    if (pol.district_type === 'SCHOOL' && pol.government_name) {
      const schoolName = pol.government_name.split(',')[0];
      return cleanChamber ? `${schoolName} ${cleanChamber}` : schoolName;
    }
    if (/(_EXEC)$/.test(pol.district_type) || pol.district_type === 'COUNTY')
      return qualifyLocalTitle(cleanTitle || cleanChamber, pol);
    return qualifyLocalTitle(cleanChamber || cleanTitle, pol);
  })();

  const subtitle = (() => {
    if (dashIdx > 0) return cleanTitle.slice(dashIdx + 3);
    // NATIONAL_JUDICIAL: show court name as subtitle (e.g. "Supreme Court of the United States")
    if (pol.district_type === 'NATIONAL_JUDICIAL')
      return cleanChamber || null;
    if (pol.district_id && /^[1-9]\d*$/.test(pol.district_id))
      return `District ${pol.district_id}`;
    if (pol.district_id === '0' && !/(_EXEC)$/.test(pol.district_type))
      return 'At-Large';
    return null;
  })();

  return { title, subtitle };
}

/** Map district_type prefix to tier label */
function getTierLabel(districtType) {
  if (!districtType) return null;
  if (districtType.startsWith('NATIONAL')) return 'FEDERAL';
  if (districtType.startsWith('STATE')) return 'STATE';
  return 'LOCAL';
}

/** Tier badge colors */
function getTierColors(tier) {
  switch (tier) {
    case 'FEDERAL': return { bg: '#EFF6FF', text: '#1E40AF' };
    case 'STATE':   return { bg: '#F0FDF4', text: '#166534' };
    default:        return { bg: '#FDF4FF', text: '#7E22CE' };
  }
}

/** Check if a URL is LinkedIn */
function isLinkedInUrl(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.includes('linkedin.com');
  } catch {
    return url.toLowerCase().includes('linkedin.com');
  }
}

/** Social platform detection */
const SOCIAL_PLATFORMS = [
  { test: /facebook\.com/i,  platform: 'facebook' },
  { test: /twitter\.com|x\.com/i, platform: 'twitter' },
  { test: /instagram\.com/i, platform: 'instagram' },
  { test: /linkedin\.com/i,  platform: 'linkedin' },
  { test: /youtube\.com|youtu\.be/i, platform: 'youtube' },
];

function detectSocialPlatform(url) {
  if (!url) return null;
  for (const { test, platform } of SOCIAL_PLATFORMS) {
    if (test.test(url)) return platform;
  }
  return null;
}

/** Extract just the domain from a URL for display */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  }
}

/** Extract LinkedIn URL from politician data, and return non-LinkedIn websites */
function extractLinkedIn(pol) {
  let linkedinUrl = null;
  const websites = [];

  // Check urls[] (person-level from BallotReady)
  (pol.urls || []).forEach(url => {
    if (isLinkedInUrl(url)) {
      if (!linkedinUrl) linkedinUrl = url;
    } else {
      websites.push(url);
    }
  });

  // Check contacts[].website_url
  (pol.contacts || []).forEach(c => {
    if (c.website_url && c.website_url.trim()) {
      if (isLinkedInUrl(c.website_url)) {
        if (!linkedinUrl) linkedinUrl = c.website_url;
      }
      // websites from contacts are handled separately in contact section
    }
  });

  return { linkedinUrl, personWebsites: websites };
}

/** Format an address object for display */
function formatAddress(addr) {
  const lines = [addr.address_1, addr.address_2, addr.address_3].filter(Boolean);
  const cityState = [addr.city, addr.state].filter(Boolean).join(', ');
  const cityStateZip = [cityState, addr.postal_code].filter(Boolean).join(' ');
  if (cityStateZip) lines.push(cityStateZip);
  return lines;
}

// ── SVG Icons ────────────────────────────────────────────────────────

const CalendarIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012.02 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
    <path d="M22 6L12 13L2 6" />
  </svg>
);

const GlobeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" />
  </svg>
);

const DollarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const ExternalLinkIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ── Component ────────────────────────────────────────────────────────

/**
 * PoliticianProfile - Reusable politician profile layout component.
 */
export default function PoliticianProfile({
  politician = {},
  onBack,
  backLabel,
  children,
  banner,        // slot for injecting content inside the card after heroRow
  style = {},
  legislativeSummary,
  judicialRecord,
  politicianId,
  onNavigateToRecord,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pol = politician;

  // ── Derived data ───────────────────────────────────────────────────

  const displayName = pol.full_name ||
    [pol.first_name, pol.last_name].filter(Boolean).join(' ') ||
    'Unknown';

  const label = backLabel || displayName;

  const profileImageUrl = (() => {
    if (pol.images && pol.images.length > 0) {
      const defaultImg = pol.images.find(img => img.type === 'default');
      return defaultImg ? defaultImg.url : pol.images[0].url;
    }
    return pol.photo_origin_url;
  })();

  const initials = [pol.first_name, pol.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join('');

  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [profileImageUrl]);

  // Social handles
  const getSocialHandle = (type) => {
    const identifier = pol.identifiers?.find(
      (i) => i.identifier_type?.toUpperCase() === type.toUpperCase()
    );
    return identifier?.identifier_value;
  };

  const twitter = getSocialHandle('TWITTER');
  const facebook = getSocialHandle('FACEBOOK');
  const instagram = getSocialHandle('INSTAGRAM');

  // LinkedIn detection
  const { linkedinUrl, personWebsites } = extractLinkedIn(pol);

  // Tier badge
  const tier = getTierLabel(pol.district_type);
  const tierColors = tier ? getTierColors(tier) : null;

  // Title & subtitle (no party)
  const { title: roleTitle, subtitle: roleSubtitle } = buildTitleAndSubtitle(pol);
  const roleLine = [roleTitle, roleSubtitle].filter(Boolean).join(' \u2013 ');

  // Term
  const termLine = getTermLine(pol);

  // Committees
  const committees = (pol.committees || []).map((c) => ({
    name: c.name,
    position: c.position,
    url: c.urls?.[0],
  }));

  // ── Contact data (grouped by type) ────────────────────────────────

  // Group addresses
  const addresses = (pol.addresses || []).map(addr => ({
    type: addr.contact_type || addr.type || 'Office',
    lines: formatAddress(addr),
  })).filter(a => a.lines.length > 0);

  // Group phones, emails, websites by contact_type
  const phonesByType = {};
  const emailsByType = {};
  const allWebsites = [];        // non-social websites only
  const socialWebsiteUrls = [];  // social platform URLs detected from websites list

  (pol.contacts || []).forEach(c => {
    const cType = c.contact_type || 'Office';
    if (c.phone && c.phone.trim()) {
      if (!phonesByType[cType]) phonesByType[cType] = [];
      phonesByType[cType].push(c.phone.trim());
    }
    if (c.email && c.email.trim()) {
      if (!emailsByType[cType]) emailsByType[cType] = [];
      emailsByType[cType].push(c.email.trim());
    }
    if (c.website_url && c.website_url.trim() && !isLinkedInUrl(c.website_url)) {
      const url = c.website_url.trim();
      if (detectSocialPlatform(url)) {
        if (!socialWebsiteUrls.includes(url)) socialWebsiteUrls.push(url);
      } else {
        allWebsites.push(url);
      }
    }
  });

  // Add BallotReady person-level emails
  (pol.email_addresses || []).forEach(email => {
    if (email && email.trim()) {
      if (!emailsByType['General']) emailsByType['General'] = [];
      if (!Object.values(emailsByType).flat().includes(email.trim())) {
        emailsByType['General'].push(email.trim());
      }
    }
  });

  // Add person-level websites (non-LinkedIn), deduplicated, splitting social vs plain
  personWebsites.forEach(url => {
    if (detectSocialPlatform(url)) {
      if (!socialWebsiteUrls.includes(url)) socialWebsiteUrls.push(url);
    } else {
      if (!allWebsites.includes(url)) allWebsites.push(url);
    }
  });

  const hasAddresses = addresses.length > 0;
  const hasPhones = Object.keys(phonesByType).length > 0;
  const hasEmails = Object.values(emailsByType).some(emails => emails.some(e => e && e.trim()));
  const hasWebsites = allWebsites.length > 0;
  const hasWebsitesCol = hasWebsites || twitter || facebook || instagram || linkedinUrl || socialWebsiteUrls.length > 0;
  const hasContactInfo = hasAddresses || hasPhones || hasEmails || hasWebsitesCol;
  const hasSocial = twitter || facebook || instagram || linkedinUrl;

  // ── Styles ─────────────────────────────────────────────────────────

  const divider = {
    borderTop: '1px solid #E5E7EB',
    margin: `${spacing[6]} 0`,
  };

  const sectionHeading = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontFamily: fonts.primary,
    fontWeight: fontWeights.semibold,
    fontSize: '18px',
    color: '#101828',
    margin: 0,
    marginBottom: spacing[4],
  };

  const styles = {
    container: {
      fontFamily: fonts.primary,
      ...style,
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[2],
      color: colors.evTeal,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.base,
      textDecoration: 'none',
      cursor: 'pointer',
      marginBottom: spacing[6],
      background: 'none',
      border: 'none',
      padding: 0,
    },
    card: {
      background: colors.bgWhite,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      padding: isMobile ? spacing[4] : spacing[8],
      marginBottom: spacing[8],
    },

    // Hero row
    heroRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? spacing[4] : spacing[8],
      alignItems: isMobile ? 'center' : 'flex-start',
    },
    photoWrap: {
      width: isMobile ? '150px' : '192px',
      height: isMobile ? '150px' : '240px',
      flexShrink: 0,
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.lg,
      objectFit: 'cover',
      background: colors.borderLight,
    },
    placeholder: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.lg,
      background: colors.evTeal,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: isMobile ? fontSizes.xl : fontSizes['3xl'],
      fontWeight: fontWeights.bold,
    },
    infoCol: {
      flex: 1,
      minWidth: 0,
      textAlign: isMobile ? 'center' : 'left',
    },
    tierBadge: tierColors ? {
      display: 'inline-block',
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: '11px',
      letterSpacing: '0.05em',
      color: tierColors.text,
      background: tierColors.bg,
      padding: '3px 10px',
      borderRadius: borderRadius.full,
      marginBottom: spacing[2],
    } : null,
    name: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: isMobile ? fontSizes['2xl'] : '30px',
      color: '#101828',
      margin: 0,
      marginBottom: spacing[1],
      lineHeight: 1.2,
    },
    roleLine: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.regular,
      fontSize: isMobile ? fontSizes.base : fontSizes.lg,
      color: '#364153',
      margin: 0,
      marginBottom: spacing[1],
    },
    officeDesc: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.base,
      color: '#6A7282',
      margin: 0,
      marginBottom: spacing[3],
      lineHeight: 1.5,
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      flexWrap: 'wrap',
      marginBottom: spacing[4],
      justifyContent: isMobile ? 'center' : 'flex-start',
    },
    metaItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      color: '#6A7282',
    },
    submitBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[2],
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      color: '#ffffff',
      background: colors.evTeal,
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing[2]} ${spacing[5]}`,
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background 0.2s',
      marginBottom: spacing[3],
    },

    // Contact section
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : (() => {
            const cols = [];
            if (hasAddresses) cols.push('1fr');
            if (hasPhones) cols.push('140px');
            if (hasEmails) cols.push('minmax(180px, 1fr)');
            if (hasWebsitesCol) cols.push('1fr');
            return cols.join(' ');
          })(),
      gap: isMobile ? spacing[4] : spacing[6],
    },
    contactGroup: {
      minWidth: 0,
    },
    contactLabel: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: '11px',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: '#6A7282',
      margin: 0,
      marginBottom: spacing[1],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[1],
    },
    contactValue: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      color: '#364153',
      lineHeight: 1.6,
      margin: 0,
      marginBottom: spacing[2],
    },
    contactLink: {
      color: '#364153',
      textDecoration: 'none',
      wordBreak: 'break-all',
    },
    contactSubLabel: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: '12px',
      color: '#9CA3AF',
      margin: 0,
      marginBottom: spacing[1],
    },

    // Coming soon
    comingSoon: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      color: '#6A7282',
      background: '#F3F4F6',
      padding: `${spacing[1]} ${spacing[3]}`,
      borderRadius: borderRadius.full,
    },
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div style={styles.container} className="ev-politician-profile">
      {/* Back link */}
      {onBack && (
        <button
          type="button"
          style={styles.backLink}
          onClick={onBack}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          {label}
        </button>
      )}

      {/* Main card */}
      <div style={styles.card}>

        {/* ── Section 1: Hero Row ── */}
        <div style={styles.heroRow}>
          {/* Photo */}
          <div style={styles.photoWrap}>
            {profileImageUrl && !imgError ? (
              <img
                src={profileImageUrl}
                alt={`${displayName} portrait`}
                style={styles.photo}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={styles.placeholder}>{initials || '?'}</div>
            )}
          </div>

          {/* Info */}
          <div style={styles.infoCol}>
            {styles.tierBadge && (
              <div style={styles.tierBadge}>{tier}</div>
            )}
            <h1 style={styles.name}>{displayName}</h1>
            {banner}
            <p style={styles.roleLine}>{roleLine}</p>

            {pol.office_description && (
              <p style={styles.officeDesc}>{pol.office_description}</p>
            )}

            {/* Term + Years in Office */}
            {(termLine || pol.total_years_in_office > 0) && (
              <div style={styles.metaRow}>
                {termLine && (
                  <span style={styles.metaItem}>
                    <CalendarIcon size={14} />
                    {termLine}
                  </span>
                )}
                {pol.total_years_in_office > 0 && (
                  <span style={styles.metaItem}>
                    <ClockIcon size={14} />
                    {pol.total_years_in_office} {pol.total_years_in_office === 1 ? 'year' : 'years'} in office
                  </span>
                )}
              </div>
            )}

            {/* Submit a Message button */}
            {pol.web_form_url && (
              <a
                href={pol.web_form_url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.submitBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.evTealDark; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = colors.evTeal; }}
              >
                <ExternalLinkIcon size={14} />
                Submit a Message
              </a>
            )}

            {/* Social icons moved to bottom of websites column in contact section */}
          </div>
        </div>

        {/* ── Section 2: Contact Info ── */}
        {hasContactInfo && (
          <>
            <div style={divider} />
            <div style={sectionHeading}>
              <MailIcon size={20} />
              Contact Information
            </div>
            <div style={styles.contactGrid}>
              {/* Addresses column */}
              {hasAddresses && (
                <div style={styles.contactGroup}>
                  <p style={styles.contactLabel}>
                    <MapPinIcon size={12} />
                    Addresses
                  </p>
                  {addresses.map((addr, i) => (
                    <div key={`addr-${i}`}>
                      <p style={{ ...styles.contactSubLabel, ...(i === 0 ? { marginTop: 0 } : { marginTop: spacing[2] }) }}>
                        {addr.type}
                      </p>
                      <p style={styles.contactValue}>
                        {addr.lines.map((line, j) => (
                          <React.Fragment key={j}>
                            {line}
                            {j < addr.lines.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Phones column */}
              {hasPhones && (
                <div style={styles.contactGroup}>
                  <p style={styles.contactLabel}>
                    <PhoneIcon size={12} />
                    Phone
                  </p>
                  {Object.entries(phonesByType).map(([type, phones], i) => (
                    <div key={`phone-${type}`}>
                      <p style={{ ...styles.contactSubLabel, ...(i === 0 ? { marginTop: 0 } : { marginTop: spacing[2] }) }}>
                        {type}
                      </p>
                      {phones.map((phone, j) => (
                        <p key={j} style={styles.contactValue}>
                          <a
                            href={`tel:${phone}`}
                            style={styles.contactLink}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                          >
                            {phone}
                          </a>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Emails column */}
              {hasEmails && (
                <div style={styles.contactGroup}>
                  <p style={styles.contactLabel}>
                    <MailIcon size={12} />
                    Email
                  </p>
                  {Object.entries(emailsByType).filter(([, emails]) => emails.some(e => e && e.trim())).map(([type, emails], i) => (
                    <div key={`email-${type}`}>
                      <p style={{ ...styles.contactSubLabel, ...(i === 0 ? { marginTop: 0 } : { marginTop: spacing[2] }) }}>
                        {type}
                      </p>
                      {emails.filter(e => e && e.trim()).map((email, j) => (
                        <p key={j} style={styles.contactValue}>
                          <a
                            href={`mailto:${email}`}
                            style={styles.contactLink}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                          >
                            {email}
                          </a>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Websites column */}
              {hasWebsitesCol && (
                <div style={styles.contactGroup}>
                  <p style={styles.contactLabel}>
                    <GlobeIcon size={12} />
                    Websites
                  </p>
                  {allWebsites.map((url, i) => (
                    <p key={i} style={styles.contactValue}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.contactLink}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        {extractDomain(url)}
                      </a>
                    </p>
                  ))}
                  {/* Social icon-only links at bottom of websites column */}
                  {(hasSocial || socialWebsiteUrls.length > 0) && (
                    <SocialLinks
                      twitter={twitter}
                      facebook={facebook}
                      instagram={instagram}
                      linkedin={linkedinUrl}
                      extraLinks={socialWebsiteUrls}
                      size="sm"
                      style={{ marginTop: allWebsites.length > 0 ? '8px' : 0 }}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Section 3: Committee Memberships ── */}
        {committees.length > 0 && (
          <>
            <div style={divider} />
            <CommitteeTable committees={committees} />
          </>
        )}

        {/* ── Section 4: Who is Funding? ── (commented out until ready)
        <div style={divider} />
        <div style={sectionHeading}>
          <DollarIcon size={20} />
          Who is Funding?
        </div>
        <div style={styles.comingSoon}>
          Coming soon
        </div>
        */}

        {/* ── Section 5: Legislative Summary / Judicial Scorecard ── */}
        {pol.is_judicial ? (
          <JudicialScorecard
            judicialRecord={judicialRecord}
            politicianId={politicianId}
            onNavigateToRecord={onNavigateToRecord}
          />
        ) : (
          <LegislativeInlineSummary
            summary={legislativeSummary}
            politicianId={politicianId}
            onNavigateToRecord={onNavigateToRecord}
          />
        )}
      </div>

      {/* Children slot (compass/radar chart section) */}
      {children}
    </div>
  );
}
