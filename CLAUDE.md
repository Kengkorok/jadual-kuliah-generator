# Jadual Kuliah Generator — Project Documentation

## Project Overview
Single-file HTML/JavaScript web application for creating professional mosque lecture schedules with PNG/PDF export. Target audience: Islamic institutions in Malaysia and Malay-speaking regions.

## Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (no frameworks)
- **Storage**: Browser localStorage
- **Export Libraries**: html2canvas (CDN), jsPDF (CDN)
- **Fonts**: Google Fonts + Adobe Typekit (CDN)

## Key Constraints
- Single-file application (no build process needed)
- All data stored locally on user's device (privacy-first)
- Must work offline except for first-time export CDN loads
- Target: Desktop/Tablet (mobile support secondary)

## Security Considerations
- All user inputs are HTML-escaped before rendering (prevents XSS)
- File uploads validated by MIME type (image files only)
- localStorage has ~5-10MB quota - images automatically downsampled
- No server/cloud communication - complete offline capability

## Development Guidelines

### When Adding New Features:
1. Keep it in the single HTML file (no splitting)
2. Escape user inputs using `escapeHtml()` helper function
3. Validate file uploads using `isValidImageFile()` function
4. Test in Chrome, Firefox, Safari, and Edge
5. Update README.md with feature documentation in BOTH Malay and English
6. Update version in README.md and create git tag

### Code Style:
- No strict formatting requirements (existing style is casual)
- Use descriptive variable names
- Add comments for non-obvious logic only
- Keep CSS in <style> block, JS in <script> block

### Testing:
- Test all export formats (PNG, PDF) at A3 and A4 sizes
- Test localStorage persistence and quota limits
- Test with multiple browsers
- Test keyboard navigation (sidebar resizer, form inputs)
- Test accessibility with WAVE or axe DevTools

### Before Publishing:
- Verify all XSS protections (run through console with malicious inputs)
- Test file upload validation
- Check WCAG 2.1 AA compliance
- Update version number
- Create git tag (v1.0.0, v1.1.0, etc.)
- Test README renders correctly on GitHub

## File Structure
```
jadual-kuliah-generator/
├── jadual-kuliah-generator.html    (Main application - 1600+ lines)
├── README.md                        (Bilingual user guide)
├── LICENSE                          (GPL v3)
├── CLAUDE.md                        (This file - developer notes)
├── .gitignore                       (Git ignore rules)
└── CHANGELOG.md                     (Version history - optional)
```

## Known Limitations
- No mobile optimization (works but UI not optimal)
- Max 2 lecture slots per date (by design)
- localStorage quota limits image sizes
- Depends on CDN for html2canvas/jsPDF on first export
- No user authentication (all data local)

## Future Enhancement Ideas
- Dark mode toggle
- Multiple language support beyond Malay/English
- Print-to-PDF directly without CDN
- Mobile-optimized layout
- Recurring lecture patterns
- Integration with Google Calendar

## Accessibility & Compliance
- WCAG 2.1 AA compliant (keyboard navigation, color contrast)
- All images have alt text or are decorative
- Form inputs have proper labels
- Color not sole means of information conveyance
- Sidebar resizer keyboard accessible (Arrow keys)

## License
GNU General Public License v3.0 (GPLv3)
- Free to use, modify, and distribute
- Any modifications must also be open source under GPLv3
- See LICENSE file for full terms
