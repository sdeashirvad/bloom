/**
 * Memory Book HTML template engine.
 *
 * Produces a self-contained HTML string that expo-print renders into a PDF.
 * The output is an emotional keepsake — not a data export.
 *
 * Visual language: editorial, airy, warm, book-like.
 * Typography: Georgia (serif) for headings/quotes, system sans-serif for body.
 */

import { ReflectionEntry } from '@/types/reflection';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemoryBookInput {
  userName: string;
  pregnancyWeek: number;
  dueDate?: string;
  entries: ReflectionEntry[];
  generatedAt: Date;
}

interface TrimesterSection {
  trimester: 1 | 2 | 3;
  label: string;
  subtitle: string;
  entries: ReflectionEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TRIMESTER_SUBTITLES: Record<1 | 2 | 3, string> = {
  1: 'A tender beginning — the first quiet weeks of wondering and becoming.',
  2: 'Movement, emotion, and growing anticipation — the heart of the journey.',
  3: 'The final chapter — a deepening readiness to meet each other.',
};

const MOOD_WORDS: Record<string, string> = {
  calm: 'Calm',
  tired: 'Tired',
  emotional: 'Emotional',
  anxious: 'Anxious',
  happy: 'Happy',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function groupByTrimester(entries: ReflectionEntry[]): TrimesterSection[] {
  const map = new Map<1 | 2 | 3, ReflectionEntry[]>([[1, []], [2, []], [3, []]]);
  for (const e of entries) {
    const t = e.trimester;
    if (t === 1 || t === 2 || t === 3) map.get(t)!.push(e);
  }

  const labels: Record<1 | 2 | 3, string> = {
    1: 'First Trimester',
    2: 'Second Trimester',
    3: 'Third Trimester',
  };

  return ([1, 2, 3] as const)
    .filter((t) => map.get(t)!.length > 0)
    .map((t) => ({
      trimester: t,
      label: labels[t],
      subtitle: TRIMESTER_SUBTITLES[t],
      entries: map.get(t)!,
    }));
}

// ─── Shared CSS ───────────────────────────────────────────────────────────────

function buildStyles(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      background: #FBF7F0;
      color: #2D1F17;
      font-family: Georgia, 'Palatino Linotype', Palatino, 'Book Antiqua', serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Pages ── */
    .page {
      width: 100%;
      min-height: 297mm;
      padding: 68pt 64pt;
      page-break-after: always;
      position: relative;
      background: #FBF7F0;
      display: flex;
      flex-direction: column;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* ── Cover ── */
    .cover {
      align-items: center;
      justify-content: center;
      text-align: center;
      background: #FBF7F0;
    }

    .cover-bloom {
      font-size: 58pt;
      color: #D4876A;
      letter-spacing: -1.5pt;
      line-height: 1;
      margin-bottom: 4pt;
    }

    .cover-floral {
      font-size: 22pt;
      color: #E8C4A8;
      margin-bottom: 40pt;
      letter-spacing: 8pt;
    }

    .cover-tagline {
      font-size: 15pt;
      color: #8B7355;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      letter-spacing: 3pt;
      text-transform: uppercase;
      margin-bottom: 56pt;
    }

    .cover-for {
      font-size: 26pt;
      color: #4A3728;
      letter-spacing: -0.4pt;
      line-height: 1.3;
      margin-bottom: 10pt;
    }

    .cover-date {
      font-size: 12pt;
      color: #B09A80;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      letter-spacing: 1pt;
    }

    .cover-decor-line {
      width: 48pt;
      height: 1pt;
      background: #E8C4A8;
      margin: 32pt auto;
    }

    .cover-bottom {
      margin-top: auto;
      text-align: center;
    }

    .cover-bottom-text {
      font-size: 10pt;
      color: #D4BFA5;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      letter-spacing: 0.5pt;
    }

    /* ── Letter page ── */
    .letter {
      background: #FBF7F0;
    }

    .letter-eyebrow {
      font-size: 9pt;
      color: #B09A80;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 600;
      letter-spacing: 2.5pt;
      text-transform: uppercase;
      margin-bottom: 36pt;
    }

    .letter-body {
      font-size: 14pt;
      color: #4A3728;
      line-height: 2;
      max-width: 400pt;
    }

    .letter-body p {
      margin-bottom: 20pt;
    }

    .letter-body p:last-child {
      margin-bottom: 0;
    }

    .letter-sign {
      margin-top: 48pt;
      font-size: 18pt;
      color: #D4876A;
      letter-spacing: -0.2pt;
    }

    /* ── Kept close section ── */
    .kept-close-header {
      display: flex;
      align-items: center;
      gap: 10pt;
      margin-bottom: 8pt;
    }

    .kept-close-heart {
      font-size: 13pt;
      color: #D4876A;
    }

    .kept-close-title {
      font-size: 11pt;
      color: #D4876A;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 600;
      letter-spacing: 1.5pt;
      text-transform: uppercase;
    }

    .kept-close-subtitle {
      font-size: 13pt;
      color: #8B7355;
      font-style: italic;
      margin-bottom: 36pt;
    }

    /* ── Trimester section header ── */
    .trimester-page {
      justify-content: flex-end;
      padding-bottom: 80pt;
    }

    .trimester-number {
      font-size: 9pt;
      color: #B09A80;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 600;
      letter-spacing: 2.5pt;
      text-transform: uppercase;
      margin-bottom: 18pt;
    }

    .trimester-title {
      font-size: 48pt;
      color: #2D1F17;
      letter-spacing: -1.5pt;
      line-height: 1.05;
      margin-bottom: 28pt;
    }

    .trimester-subtitle {
      font-size: 14pt;
      color: #8B7355;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      line-height: 1.7;
      max-width: 340pt;
    }

    .trimester-decor {
      width: 36pt;
      height: 1pt;
      background: #E8C4A8;
      margin-bottom: 28pt;
    }

    /* ── Content pages (entries) ── */
    .content-page {
      padding-top: 56pt;
    }

    /* ── Entry ── */
    .entry {
      margin-bottom: 48pt;
      page-break-inside: avoid;
    }

    .entry:last-child {
      margin-bottom: 0;
    }

    .entry-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12pt;
    }

    .entry-week-mood {
      font-size: 10pt;
      color: #B09A80;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 500;
      letter-spacing: 0.5pt;
    }

    .entry-date {
      font-size: 10pt;
      color: #D4BFA5;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
    }

    .entry-milestone {
      font-size: 11pt;
      color: #D4876A;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin-bottom: 12pt;
      letter-spacing: 0.2pt;
    }

    .entry-kept-close {
      font-size: 10pt;
      color: #D4876A;
      margin-bottom: 10pt;
      opacity: 0.7;
    }

    .entry-reflection {
      font-size: 18pt;
      color: #2D1F17;
      line-height: 1.65;
      font-style: italic;
      letter-spacing: -0.2pt;
      margin-bottom: 18pt;
    }

    .entry-bloom-label {
      font-size: 9pt;
      color: #B09A80;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 600;
      letter-spacing: 2pt;
      text-transform: uppercase;
      margin-bottom: 7pt;
    }

    .entry-bloom-reply {
      font-size: 13pt;
      color: #8B7355;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      line-height: 1.75;
      font-style: italic;
    }

    .entry-separator {
      width: 100%;
      height: 1pt;
      background: #EDE5D8;
      margin-top: 36pt;
    }

    /* ── Closing page ── */
    .closing {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .closing-quote {
      font-size: 22pt;
      color: #4A3728;
      line-height: 1.6;
      max-width: 380pt;
      letter-spacing: -0.3pt;
      margin-bottom: 64pt;
    }

    .closing-bloom {
      font-size: 32pt;
      color: #D4876A;
      letter-spacing: -0.8pt;
      margin-bottom: 8pt;
    }

    .closing-tagline {
      font-size: 11pt;
      color: #D4BFA5;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      letter-spacing: 2pt;
    }

    .closing-decor-line {
      width: 36pt;
      height: 1pt;
      background: #E8C4A8;
      margin: 36pt auto;
    }

    .closing-privacy {
      font-size: 10pt;
      color: #D4BFA5;
      font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      font-style: italic;
      letter-spacing: 0.2pt;
    }
  `;
}

// ─── Page builders ────────────────────────────────────────────────────────────

function buildCoverPage(input: MemoryBookInput): string {
  const name = input.userName ? escape(input.userName) : null;
  const generatedYear = input.generatedAt.getFullYear();
  const generatedMonth = input.generatedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const forLine = name
    ? `For ${name} &amp; little one`
    : 'A quiet collection of moments from this pregnancy journey.';

  const dateLine = input.dueDate
    ? `Due ${escape(input.dueDate)}`
    : `${generatedMonth}`;

  return `
    <div class="page cover">
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div class="cover-bloom">Bloom</div>
        <div class="cover-floral">✿ ✦ ✿</div>
        <div class="cover-tagline">Your Journey</div>
        <div class="cover-decor-line"></div>
        <div class="cover-for">${forLine}</div>
        <div class="cover-date">${dateLine}</div>
      </div>
      <div class="cover-bottom">
        <div class="cover-bottom-text">A memory book — created with care, for you.</div>
      </div>
    </div>
  `;
}

function buildOpeningLetterPage(userName: string): string {
  const name = userName ? escape(userName) : null;
  const salutation = name ? `Dear ${name},` : 'Dear you,';

  return `
    <div class="page letter">
      <div class="letter-eyebrow">A note from Bloom</div>
      <div class="letter-body">
        <p>${salutation}</p>
        <p>These pages hold small moments from your journey — reflections, emotions, difficult days, and quiet joys you chose to share.</p>
        <p>Pregnancy changes us slowly, deeply, and often invisibly. Some of it you'll remember clearly. Some of it you've already begun to forget. That's why these moments matter — not as a record, but as a reminder of who you were during this season.</p>
        <p>Whatever you carried here — exhaustion, wonder, fear, love, uncertainty — it was real. And it was enough.</p>
        <p>Bloom was honored to walk beside you through it.</p>
      </div>
      <div class="letter-sign">Bloom ✦</div>
    </div>
  `;
}

function buildKeptCloseSection(entries: ReflectionEntry[]): string {
  if (entries.length === 0) return '';

  const entryHtml = entries.map((e, i) => buildEntry(e, i === entries.length - 1)).join('');

  return `
    <div class="page content-page">
      <div class="kept-close-header">
        <span class="kept-close-heart">❤</span>
        <span class="kept-close-title">Moments Kept Close</span>
      </div>
      <div class="kept-close-subtitle">These reflections meant something more.</div>
      ${entryHtml}
    </div>
  `;
}

function buildTrimesterHeaderPage(section: TrimesterSection): string {
  const ordinals = ['First', 'Second', 'Third'];
  const ordinal = ordinals[section.trimester - 1];

  return `
    <div class="page trimester-page">
      <div class="trimester-number">${ordinal} Trimester</div>
      <div class="trimester-decor"></div>
      <div class="trimester-title">${escape(section.label)}</div>
      <div class="trimester-subtitle">${escape(section.subtitle)}</div>
    </div>
  `;
}

function buildEntry(entry: ReflectionEntry, isLast: boolean): string {
  const moodWord = MOOD_WORDS[entry.mood] ?? entry.mood;
  const weekMoodLine = `Week ${entry.pregnancyWeek} &nbsp;·&nbsp; ${escape(moodWord)}`;
  const dateStr = formatShortDate(entry.createdAt);

  const milestoneHtml = entry.milestoneTag
    ? `<div class="entry-milestone">✦ &nbsp;${escape(entry.milestoneTag)}</div>`
    : '';

  const keptCloseHtml = entry.keptClose
    ? `<div class="entry-kept-close">❤ &nbsp;Kept close</div>`
    : '';

  const reflectionHtml = entry.userReflection
    ? `<div class="entry-reflection">&ldquo;${escape(entry.userReflection)}&rdquo;</div>`
    : '';

  const separator = isLast ? '' : `<div class="entry-separator"></div>`;

  return `
    <div class="entry">
      <div class="entry-meta">
        <span class="entry-week-mood">${weekMoodLine}</span>
        <span class="entry-date">${dateStr}</span>
      </div>
      ${milestoneHtml}
      ${keptCloseHtml}
      ${reflectionHtml}
      <div class="entry-bloom-label">Bloom</div>
      <div class="entry-bloom-reply">${escape(entry.bloomReply)}</div>
      ${separator}
    </div>
  `;
}

function buildTrimesterContentPages(entries: ReflectionEntry[]): string {
  if (entries.length === 0) return '';

  // Split entries across pages — ~4 entries per page to keep whitespace generous
  const ENTRIES_PER_PAGE = 4;
  const pages: ReflectionEntry[][] = [];
  for (let i = 0; i < entries.length; i += ENTRIES_PER_PAGE) {
    pages.push(entries.slice(i, i + ENTRIES_PER_PAGE));
  }

  return pages.map((pageEntries) => {
    const html = pageEntries.map((e, i) => buildEntry(e, i === pageEntries.length - 1)).join('');
    return `<div class="page content-page">${html}</div>`;
  }).join('');
}

function buildClosingPage(): string {
  return `
    <div class="page closing">
      <div class="closing-quote">
        Your journey was never measured by perfect days —
        only by the love, courage, and tenderness you carried through each one.
      </div>
      <div class="closing-decor-line"></div>
      <div class="closing-bloom">Bloom</div>
      <div class="closing-tagline">Made with care, for you.</div>
      <div class="closing-decor-line"></div>
      <div class="closing-privacy">Your memory book was created entirely on your device.</div>
    </div>
  `;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Build the complete HTML string for the memory book PDF.
 * Pass this directly to expo-print's `html` option.
 */
export function buildMemoryBookHtml(input: MemoryBookInput): string {
  const { entries, userName } = input;

  if (entries.length === 0) {
    return buildEmptyStateHtml(userName);
  }

  const keptCloseEntries = entries.filter((e) => e.keptClose === true);
  const trimesterSections = groupByTrimester(entries);

  const keptCloseSection = keptCloseEntries.length > 0
    ? buildKeptCloseSection(keptCloseEntries)
    : '';

  const trimesterPages = trimesterSections
    .map((section) =>
      buildTrimesterHeaderPage(section) +
      buildTrimesterContentPages(section.entries)
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bloom — Your Journey</title>
  <style>${buildStyles()}</style>
</head>
<body>
  ${buildCoverPage(input)}
  ${buildOpeningLetterPage(userName)}
  ${keptCloseSection}
  ${trimesterPages}
  ${buildClosingPage()}
</body>
</html>`;
}

function buildEmptyStateHtml(userName: string): string {
  const name = userName ? escape(userName) : null;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${buildStyles()}</style>
</head>
<body>
  ${buildCoverPage({
    userName,
    pregnancyWeek: 0,
    entries: [],
    generatedAt: new Date(),
  })}
  ${buildOpeningLetterPage(userName)}
  <div class="page closing">
    <div class="closing-quote">
      Your journey is just beginning.
      When you've shared your first moments with Bloom,
      they'll find their home here.
    </div>
    <div class="closing-bloom">Bloom</div>
    <div class="closing-tagline">Made with care, for you.</div>
  </div>
</body>
</html>`;
}
