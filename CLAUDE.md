# Jadual Kuliah Generator — Developer notes

The public application opens through `jadual-kuliah-generator.html` with adjacent `app.css` and JavaScript files. It is vanilla JavaScript and CSS; users do not need Node.js, a build process or an account. PNG/PDF export lazy-loads html2canvas and jsPDF from jsDelivr. It targets Malay-speaking mosque and surau administrators.

## Data and behavior

- localStorage key: `jkg_public_v3`. The workspace contains independent profiles; each owns its months, recurring rules, speaker library, poster settings and optional donation QR.
- Profile JSON format: `jadual-kuliah-generator`, version 3. Workspace backups use `jadual-kuliah-workspace`, version 3.
- Import adds copies. Existing profiles and months are not overwritten. Legacy single-month JSON is imported as a new profile.
- A rule uses weekday and occurrence (0 = every week, 1–5 = nth weekday). Maximum two sessions per date. Manual overrides apply to whole dates and survive applying rules.
- QR images retain their original bytes. Other uploads are validated and resized locally. No external requests, tracking or cloud storage.
- Export dependencies: html2canvas 1.4.1 and jsPDF 2.5.1 load from jsDelivr when exporting.
- Public defaults and examples must remain generic. Do not bundle personal backups, bank QR images, institutional logos or real speaker portraits from local editions.

## Development

Keep the distributable small and browser-openable from the repo folder. Escape user text inserted into HTML, use textContent where practical, and validate uploaded data. Keep profile switching and imports isolated. Document behavior changes in README.md in Malay and English and update CHANGELOG.md / version for releases.

Run `npm install` and `npm test` for development checks (Node.js and installed Edge/Chrome required). `TEST_BROWSERS` selects a comma-separated subset; `GENERATOR_HTML` can point to another HTML; `TEST_ARTIFACTS` selects the test output directory. Default output goes to the OS temporary directory.

The tests cover blank/generic startup, profile isolation, reusable speakers, recurring rules and monthly overrides, backups/imports, QR placement, calendar alignment, XSS escaping, basic keyboard/mobile interaction, storage failure and A3/A4 PNG/PDF export. Review exported poster images visually when changing layout. Do not claim untested browser or accessibility compliance.

## Limits

Desktop Edge and Chrome on Windows have been tested. Mobile layout is supported, but full mobile/browser coverage is not claimed. Firefox and Safari are untested. PDF output is rasterized. System fonts and source image quality affect results. Browser localStorage can fill; users should export JSON backups regularly.
