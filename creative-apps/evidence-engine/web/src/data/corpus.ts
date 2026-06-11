// The case corpus is shared verbatim with the MCP server (../corpus).
// Bundled at build time so the hosted game is fully static — no keys, no backend.
import caseOverview from "../../../corpus/01-case-overview.md?raw";
import victimProfile from "../../../corpus/02-victim-profile.md?raw";
import characterHelena from "../../../corpus/03-character-helena.md?raw";
import characterFelix from "../../../corpus/04-character-felix.md?raw";
import characterNora from "../../../corpus/05-character-nora.md?raw";
import helenaStatement from "../../../corpus/06-helena-statement.md?raw";
import felixStatement from "../../../corpus/07-felix-statement.md?raw";
import noraStatement from "../../../corpus/08-nora-statement.md?raw";
import securityLog from "../../../corpus/09-security-log.md?raw";
import forensicReport from "../../../corpus/10-forensic-report.md?raw";
import autopsyReport from "../../../corpus/11-autopsy-report.md?raw";
import galleryInventory from "../../../corpus/12-gallery-inventory.md?raw";
import phoneRecords from "../../../corpus/13-phone-records.md?raw";
import provenanceDispute from "../../../corpus/14-provenance-dispute.md?raw";
import detectiveNotes from "../../../corpus/15-detective-notes.md?raw";

export const CORPUS: Record<string, string> = {
  "01-case-overview.md": caseOverview,
  "02-victim-profile.md": victimProfile,
  "03-character-helena.md": characterHelena,
  "04-character-felix.md": characterFelix,
  "05-character-nora.md": characterNora,
  "06-helena-statement.md": helenaStatement,
  "07-felix-statement.md": felixStatement,
  "08-nora-statement.md": noraStatement,
  "09-security-log.md": securityLog,
  "10-forensic-report.md": forensicReport,
  "11-autopsy-report.md": autopsyReport,
  "12-gallery-inventory.md": galleryInventory,
  "13-phone-records.md": phoneRecords,
  "14-provenance-dispute.md": provenanceDispute,
  "15-detective-notes.md": detectiveNotes,
};

export function getDocument(docKey: string): string | null {
  return CORPUS[docKey] ?? null;
}
