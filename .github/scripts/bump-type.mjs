// Usage: node bump-type.mjs <oldVersion> <newVersion>
// Prints: "major" | "minor" | "patch" | "none"
// Exits 1 if either version is malformed.

const [, , oldV, newV] = process.argv;

function parse(v) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v ?? '');
  if (!m) {
    console.error(`Invalid semver: ${v}`);
    process.exit(1);
  }
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

const a = parse(oldV);
const b = parse(newV);

let bump = 'none';
if (b.major > a.major) bump = 'major';
else if (b.minor > a.minor) bump = 'minor';
else if (b.patch > a.patch) bump = 'patch';

process.stdout.write(bump);
