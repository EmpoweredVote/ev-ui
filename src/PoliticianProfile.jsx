import React, { useState, useEffect } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';
import useMediaQuery from './useMediaQuery';
import SocialLinks from './SocialLinks.jsx';
import CommitteeTable from './CommitteeTable.jsx';

function formatTermDate(dateStr, precision) {
  if (!dateStr) return null;
  // Year-only precision: return the raw year string directly.
  // Avoids new Date("2024") UTC timezone bug (shows "Dec 2023" in US timezones
  // because "2024" parses as midnight UTC Jan 1, which is Dec 31 in US local time).
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
  return `First elected: ${start} \u2014 Term ends: ${end}`;
}

/** Strip "(Retain Name?)" from BallotReady retention election artifacts */
function stripRetain(s) {
  return (s || '').replace(/\s*\(Retain\s+.+?\?\)/, '');
}

/**
 * Qualify a generic local title with the jurisdiction name.
 * e.g. "Mayor" → "Paramount Mayor", "Sheriff" → "Los Angeles County Sheriff"
 */
function qualifyLocalTitle(baseTitle, pol) {
  if (!pol.government_name || !baseTitle) return baseTitle;

  const dt = pol.district_type || '';
  if (!dt.startsWith('LOCAL') && dt !== 'COUNTY') return baseTitle;

  const gov = pol.government_name.split(',')[0].trim();
  const govCore = gov
    .replace(/^City of\s+/i, '')
    .replace(/\s+County$/i, '')
    .trim();

  if (govCore && baseTitle.toLowerCase().includes(govCore.toLowerCase()))
    return baseTitle;

  let prefix = dt === 'COUNTY' ? gov : gov.replace(/^City of\s+/i, '');

  if (prefix.endsWith('County') && baseTitle.startsWith('County'))
    prefix = prefix.replace(/\s+County$/, '');

  return `${prefix} ${baseTitle}`;
}

/**
 * Build display title and subtitle from politician data.
 * Splits office_title on " - " to separate body from seat designation.
 * Falls back to chamber_name for state/federal where office_title has no dash.
 */
function buildTitleAndSubtitle(pol) {
  const cleanTitle = stripRetain(pol.office_title);
  const cleanChamber = stripRetain(pol.chamber_name);
  const dashIdx = cleanTitle.lastIndexOf(' - ');

  const title = (() => {
    // Dash-split: use part before dash (e.g. "Bloomington City Common Council - At Large")
    if (dashIdx > 0) return qualifyLocalTitle(cleanTitle.slice(0, dashIdx), pol);
    // SCHOOL: prepend school district name (e.g. "Los Angeles Unified Board of Education")
    if (pol.district_type === 'SCHOOL' && pol.government_name) {
      const schoolName = pol.government_name.split(',')[0];
      return cleanChamber ? `${schoolName} ${cleanChamber}` : schoolName;
    }
    // Executive/officer positions: prefer office_title (e.g. "Mayor", "Governor", "Sheriff")
    if (/(_EXEC)$/.test(pol.district_type) || pol.district_type === 'COUNTY')
      return qualifyLocalTitle(cleanTitle || cleanChamber, pol);
    // Default: prefer chamber_name (e.g. "City Council", "State Senate")
    return qualifyLocalTitle(cleanChamber || cleanTitle, pol);
  })();

  const subtitle = (() => {
    // Dash-split: use part after dash
    if (dashIdx > 0) return cleanTitle.slice(dashIdx + 3);
    // Numbered district (1+)
    if (pol.district_id && /^[1-9]\d*$/.test(pol.district_id))
      return `District ${pol.district_id}`;
    // At-large (district_id "0" = represents the whole area), but not for executives
    if (pol.district_id === '0' && !/(_EXEC)$/.test(pol.district_type))
      return 'At-Large';
    return null;
  })();

  return { title, subtitle };
}

/**
 * PoliticianProfile - Reusable politician profile layout component.
 *
 * @param {Object} props
 * @param {Object} props.politician - Full profile object from the API (PoliticianProfileOut shape)
 * @param {Function} props.onBack - Callback for back navigation
 * @param {string} props.backLabel - Text for back link (default: politician name)
 * @param {React.ReactNode} props.children - Slot for compass/radar chart section
 * @param {Object} props.style - Additional styles for outer container
 */
export default function PoliticianProfile({
  politician = {},
  onBack,
  backLabel,
  children,
  style = {},
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pol = politician;

  // Extract social handles from identifiers
  const getSocialHandle = (type) => {
    const identifier = pol.identifiers?.find(
      (i) => i.identifier_type?.toUpperCase() === type.toUpperCase()
    );
    return identifier?.identifier_value;
  };

  // Format committees for CommitteeTable
  const committees = (pol.committees || []).map((c) => ({
    name: c.name,
    position: c.position,
    url: c.urls?.[0],
  }));

  // Build display name
  const displayName = pol.full_name ||
    [pol.first_name, pol.last_name].filter(Boolean).join(' ') ||
    'Unknown';

  const label = backLabel || displayName;

  // Get profile image URL - prefer images array from BallotReady, fall back to photo_origin_url
  const profileImageUrl = (() => {
    if (pol.images && pol.images.length > 0) {
      // Prefer "default" type image, otherwise use first image
      const defaultImg = pol.images.find(img => img.type === 'default');
      return defaultImg ? defaultImg.url : pol.images[0].url;
    }
    return pol.photo_origin_url;
  })();

  // Collect contact items from enriched contacts + BallotReady person-level data
  const contactPhones = [];
  const contactWebsites = [];
  const contactEmails = [];

  let latestSyncedAt = null;

  (pol.contacts || []).forEach(c => {
    if (c.phone && c.phone.trim()) contactPhones.push(c.phone);
    if (c.website_url && c.website_url.trim()) contactWebsites.push(c.website_url);
    if (c.email && c.email.trim()) contactEmails.push(c.email);
    if (c.synced_at && (!latestSyncedAt || c.synced_at > latestSyncedAt)) {
      latestSyncedAt = c.synced_at;
    }
  });

  // Add BallotReady person-level data if not already present
  const brWebsite = pol.urls?.[0];
  if (brWebsite && !contactWebsites.includes(brWebsite)) contactWebsites.push(brWebsite);
  const brEmail = pol.email_addresses?.[0];
  if (brEmail && !contactEmails.includes(brEmail)) contactEmails.push(brEmail);

  const twitter = getSocialHandle('TWITTER');
  const facebook = getSocialHandle('FACEBOOK');
  const instagram = getSocialHandle('INSTAGRAM');

  const hasSocial = twitter || facebook || instagram || pol.web_form_url;
  const hasAnyContact = contactPhones.length > 0 || contactWebsites.length > 0
    || contactEmails.length > 0 || hasSocial;

  const iconSize = '14px';

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
    topCard: {
      background: colors.bgWhite,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      padding: isMobile ? spacing[4] : spacing[8],
      marginBottom: spacing[8],
    },
    topRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? spacing[4] : spacing[8],
      alignItems: isMobile ? 'center' : 'flex-start',
    },
    leftCol: {
      width: isMobile ? '150px' : '192px',
      flexShrink: 0,
    },
    photoContainer: {
      width: '100%',
      height: isMobile ? '150px' : '240px',
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.lg,
      objectFit: 'cover',
      background: colors.borderLight,
    },
    placeholder: {
      width: isMobile ? '150px' : '192px',
      height: isMobile ? '150px' : '240px',
      borderRadius: borderRadius.lg,
      background: colors.evTeal,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: isMobile ? fontSizes.xl : fontSizes['3xl'],
      fontWeight: fontWeights.bold,
    },
    contactSection: {
      marginTop: spacing[4],
      paddingTop: spacing[3],
      borderTop: `1px solid ${colors.borderLight}`,
    },
    contactHeading: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      color: colors.evTeal,
      margin: 0,
      marginBottom: spacing[2],
    },
    contactItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing[1],
      marginBottom: spacing[1],
    },
    contactLink: {
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: spacing[1],
      color: colors.evTeal,
      textDecoration: 'none',
      wordBreak: 'break-all',
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      lineHeight: 1.4,
    },
    socialRow: {
      marginTop: spacing[2],
    },
    infoCol: {
      flex: 1,
      minWidth: 0,
      textAlign: 'left',
    },
    name: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: isMobile ? fontSizes['2xl'] : fontSizes['4xl'],
      color: colors.evTeal,
      margin: 0,
      marginBottom: spacing[2],
      lineHeight: 1.2,
      textAlign: isMobile ? 'center' : 'left',
    },
    title: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: isMobile ? fontSizes.base : fontSizes.xl,
      color: colors.textSecondary,
      margin: 0,
      marginBottom: spacing[1],
      textAlign: isMobile ? 'center' : 'left',
    },
    subtitle: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.regular,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
      margin: 0,
      marginBottom: spacing[2],
      textAlign: isMobile ? 'center' : 'left',
    },
    termDate: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.regular,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
      margin: 0,
      marginBottom: spacing[3],
      textAlign: isMobile ? 'center' : 'left',
    },
    section: {
      marginBottom: spacing[6],
    },
  };

  // Track broken image URLs so we can fall back to initials
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [profileImageUrl]);

  // Initials for placeholder
  const initials = [pol.first_name, pol.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join('');

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

      {/* Top card: photo + info */}
      <div style={styles.topCard}>
        <div style={styles.topRow}>
          {/* Left column: photo + contact */}
          <div style={styles.leftCol}>
            <div style={styles.photoContainer}>
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

            {/* Contact */}
            {hasAnyContact && (
              <div style={styles.contactSection}>
                <h3 style={styles.contactHeading}>Contact</h3>

                {contactPhones.map((phone, i) => (
                  <div key={`ph-${i}`} style={styles.contactItem}>
                    <a
                      href={`tel:${phone}`}
                      style={styles.contactLink}
                      onMouseEnter={(e) => { e.currentTarget.style.color = colors.evTealDark; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = colors.evTeal; }}
                    >
                      <svg style={{ width: iconSize, height: iconSize, flexShrink: 0, marginTop: '1px' }} viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012.02 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {phone}
                    </a>
                  </div>
                ))}

                {contactWebsites.map((url, i) => (
                  <div key={`web-${i}`} style={styles.contactItem}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.contactLink}
                      onMouseEnter={(e) => { e.currentTarget.style.color = colors.evTealDark; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = colors.evTeal; }}
                    >
                      <svg style={{ width: iconSize, height: iconSize, flexShrink: 0, marginTop: '1px' }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {url}
                    </a>
                  </div>
                ))}

                {contactEmails.map((email, i) => (
                  <div key={`em-${i}`} style={styles.contactItem}>
                    <a
                      href={`mailto:${email}`}
                      style={styles.contactLink}
                      onMouseEnter={(e) => { e.currentTarget.style.color = colors.evTealDark; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = colors.evTeal; }}
                    >
                      <svg style={{ width: iconSize, height: iconSize, flexShrink: 0, marginTop: '1px' }} viewBox="0 0 24 24" fill="none">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {email}
                    </a>
                  </div>
                ))}

                {hasSocial && (
                  <div style={styles.socialRow}>
                    <SocialLinks
                      twitter={twitter}
                      facebook={facebook}
                      instagram={instagram}
                      contactFormUrl={pol.web_form_url}
                      size="sm"
                    />
                  </div>
                )}

                {latestSyncedAt && (
                  <div style={{ fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textMuted, marginTop: spacing[2] }}>
                    Last updated: {new Date(latestSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={styles.infoCol}>
            <h1 style={styles.name}>{displayName}</h1>
            <h2 style={styles.title}>{buildTitleAndSubtitle(pol).title}</h2>
            {buildTitleAndSubtitle(pol).subtitle && (
              <p style={styles.subtitle}>{buildTitleAndSubtitle(pol).subtitle}</p>
            )}

            {/* Office Description */}
            {pol.office_description && (
              <p style={{ fontFamily: fonts.primary, fontSize: fontSizes.sm, fontStyle: 'italic', color: colors.textSecondary, marginBottom: spacing[4] }}>
                {pol.office_description}
              </p>
            )}

            {/* Term dates */}
            {getTermLine(pol) && (
              <p style={styles.termDate}>{getTermLine(pol)}</p>
            )}

            {/* Years in Office */}
            {pol.total_years_in_office > 0 && (
              <p style={{ fontFamily: fonts.primary, fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing[2] }}>
                {pol.total_years_in_office} {pol.total_years_in_office === 1 ? 'year' : 'years'} in office
              </p>
            )}

            {/* Committees */}
            {committees.length > 0 && (
              <div style={styles.section}>
                <CommitteeTable committees={committees} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children slot (compass/radar chart section) */}
      {children}
    </div>
  );
}
