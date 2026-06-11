import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";
import { CORPUS } from "../data/corpus";

describe("renderMarkdown", () => {
  it("renders headings, bold, and paragraphs", () => {
    const html = renderMarkdown("# Title\n\nSome **bold** text.");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders tables with header and body rows", () => {
    const html = renderMarkdown("| Time | Event |\n|------|-------|\n| 19:48 | Exit |");
    expect(html).toContain("<th>Time</th>");
    expect(html).toContain("<td>19:48</td>");
  });

  it("renders fenced code blocks verbatim", () => {
    const html = renderMarkdown("```\nCARD_EXIT | READER_01\n```");
    expect(html).toContain("<pre>CARD_EXIT | READER_01</pre>");
  });

  it("escapes HTML in source content", () => {
    const html = renderMarkdown("a <script>alert(1)</script> tag");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders every corpus document without throwing", () => {
    for (const [docKey, content] of Object.entries(CORPUS)) {
      const html = renderMarkdown(content);
      expect(html.length, docKey).toBeGreaterThan(100);
    }
  });
});
