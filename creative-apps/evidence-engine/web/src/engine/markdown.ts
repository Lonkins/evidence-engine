// Minimal markdown renderer for the case documents. The corpus uses a known
// subset (headings, bold, tables, code fences, blockquotes, lists, rules) so a
// dependency-free renderer keeps the bundle small and the output controllable.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function renderTable(lines: string[]): string {
  const rows = lines.map((line) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  const header = rows[0];
  const body = rows.slice(2); // skip the |---|---| separator row
  const head = `<thead><tr>${header.map((c) => `<th>${renderInline(c)}</th>`).join("")}</tr></thead>`;
  const cells = body
    .map((row) => `<tr>${row.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table>${head}<tbody>${cells}</tbody></table>`;
}

export function renderMarkdown(source: string): string {
  const lines = source.split("\n");
  const out: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.startsWith("```")) {
      const block: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        block.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      out.push(`<pre>${escapeHtml(block.join("\n"))}</pre>`);
      continue;
    }

    if (line.startsWith("|") && lines[index + 1]?.match(/^\|[\s\-|:]+\|?$/)) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].startsWith("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }
      out.push(renderTable(tableLines));
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      out.push("<hr/>");
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      out.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(`<li>${renderInline(lines[index].replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !/^(#{1,4}\s|---|\||>|```|[-*]\s)/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return out.join("\n");
}
