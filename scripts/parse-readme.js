const fs = require('fs');

const raw = fs.readFileSync('README.md', 'utf-8');
const items = parseReadme(raw);

const output = `// Auto-generated. Do not edit manually.

type TimelineItem = {
    date: string
    title: string
    minister: string | null
    description: string | null
    sources?: { title: string; href: string }[]
}

const timelineItems: TimelineItem[] = ${JSON.stringify(items, null, 4)};

export default timelineItems;
`;

fs.writeFileSync('src/data/timeline.ts', output);
console.log(`Generated ${items.length} timeline items.`);


function parseReadme(raw) {
  const sections = raw.split(/\n---\n/).slice(1);

  return sections.map(section => {
    const lines = section.trim().split('\n');

    const heading = lines[0].replace(/^## /, '');
    const dashIndex = heading.indexOf('—');
    const date = heading.slice(0, dashIndex).trim();
    const title = heading.slice(dashIndex + 1).trim();


    const ministerLine = lines.find(l => l.startsWith('- وزیر:'));
    const ministerRaw = ministerLine?.replace('- وزیر:', '').trim();
    const minister = (!ministerRaw || ministerRaw === '—') ? null : ministerRaw;

    const descStart = lines.findIndex(l => l.trim() === '- توضیحات:');
    const sourcesStart = lines.findIndex(l => l.trim() === '- منابع:');
    const descLines = lines
      .slice(descStart + 1, sourcesStart)
      .map(l => l.replace(/^\s{2}-\s/, '').trim())
      .filter(Boolean);
    const description = descLines.length ? descLines.join('\n') : null;


    const sourceLines = lines
      .slice(sourcesStart + 1)
      .map(l => l.replace(/^\s{2}-\s/, '').trim())
      .filter(l => l && l !== 'ندارد');

    const sources = sourceLines.map(href => ({ title: href, href }));

    return {
      date,
      title,
      minister,
      description,
      ...(sources.length ? { sources } : {}),
    };
  });
}
