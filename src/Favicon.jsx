/**
 * Favicon — renders a site's favicon via Google's favicon service.
 * Default size=16 for inline source link display.
 */
export default function Favicon({ url, size = 16 }) {
  try {
    const domain = new URL(url).hostname;
    return (
      <img
        src={`https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`}
        alt=""
        width={size}
        height={size}
        style={{ verticalAlign: 'middle', flexShrink: 0 }}
      />
    );
  } catch {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ verticalAlign: 'middle', flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
}
