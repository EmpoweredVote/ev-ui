import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';
import useMediaQuery from './useMediaQuery';
import SocialLinks from './SocialLinks.jsx';
import CommitteeTable from './CommitteeTable.jsx';

function formatTermDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getTermLine(pol) {
  const start = formatTermDate(pol.term_start);
  if (!start) return null;
  const end = formatTermDate(pol.term_end);
  if (!end) return `Since ${start}`;
  return `First elected: ${start} \u2014 Term ends: ${end}`;
}

/** Strip "(Retain Name?)" from BallotReady retention election artifacts */
function stripRetain(s) {
  return (s || '').replace(/\s*\(Retain\s+.+?\?\)/, '');
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

  const title = dashIdx > 0
    ? cleanTitle.slice(0, dashIdx)
    : (cleanChamber || cleanTitle);

  const subtitle = (() => {
    if (dashIdx > 0) return cleanTitle.slice(dashIdx + 3);
    if (cleanChamber && pol.district_id) return `District ${pol.district_id}`;
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
    photoWrap: {
      width: isMobile ? '120px' : '192px',
      height: isMobile ? '120px' : '192px',
      flexShrink: 0,
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
      background: colors.borderLight,
    },
    placeholder: {
      width: isMobile ? '120px' : '192px',
      height: isMobile ? '120px' : '192px',
      borderRadius: '50%',
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
      textAlign: 'left',
    },
    headerRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'center' : 'flex-start',
      marginBottom: spacing[4],
    },
    nameTitle: {
      flex: 1,
      minWidth: 0,
    },
    socialLinksWrap: {
      flexShrink: 0,
      marginLeft: isMobile ? 0 : spacing[4],
      marginTop: isMobile ? spacing[2] : 0,
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
          {/* Photo */}
          <div style={styles.photoWrap}>
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={`${displayName} portrait`}
                style={styles.photo}
              />
            ) : (
              <div style={styles.placeholder}>{initials || '?'}</div>
            )}
          </div>

          {/* Info */}
          <div style={styles.infoCol}>
            {/* Header row with name/title on left, social links on right */}
            <div style={styles.headerRow}>
              <div style={styles.nameTitle}>
                <h1 style={styles.name}>{displayName}</h1>
                <h2 style={styles.title}>{buildTitleAndSubtitle(pol).title}</h2>
                {buildTitleAndSubtitle(pol).subtitle && (
                  <p style={styles.subtitle}>{buildTitleAndSubtitle(pol).subtitle}</p>
                )}
              </div>
              <div style={styles.socialLinksWrap}>
                <SocialLinks
                  email={pol.email_addresses?.[0]}
                  website={pol.urls?.[0]}
                  twitter={getSocialHandle('TWITTER')}
                  facebook={getSocialHandle('FACEBOOK')}
                  instagram={getSocialHandle('INSTAGRAM')}
                  contactFormUrl={pol.web_form_url}
                  size="sm"
                />
              </div>
            </div>

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
