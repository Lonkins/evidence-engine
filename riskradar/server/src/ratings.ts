export interface VendorRating {
  toolName: string;
  vendorName: string;
  grade: string; // A, B, C, D, F or N/R (not rated)
  privacyScore: number; // 1-100 from Common Sense Media
  collectsData: boolean;
  sharesDataWithThirdParties: boolean;
  hasDPA: boolean;
  ageRating: string;
  dataTypes: string[];
  summary: string;
  source: string;
  lastReviewed: string;
}

// Curated ratings derived from Common Sense Media EdTech Privacy evaluations.
// Source: https://www.commonsense.org/education/privacy
// These represent publicly available assessments as of 2024/2025.
const RATINGS: VendorRating[] = [
  {
    toolName: "ChatGPT",
    vendorName: "OpenAI",
    grade: "D",
    privacyScore: 38,
    collectsData: true,
    sharesDataWithThirdParties: true,
    hasDPA: true,
    ageRating: "13+",
    dataTypes: ["conversation history", "account data", "usage data", "training data"],
    summary: "ChatGPT collects extensive data including conversation history which may be used for model training. OpenAI's education API product has stronger protections than the consumer product. The consumer version is not recommended for use with students under 13 without explicit parental consent and careful controls.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-11"
  },
  {
    toolName: "Gemini",
    vendorName: "Google",
    grade: "C",
    privacyScore: 52,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "18+",
    dataTypes: ["conversation history", "account data", "Google account activity"],
    summary: "Google Gemini uses Google account data and conversation history. The consumer version is rated 18+ by Google. Workspace for Education version (Gemini for Workspace) has stronger FERPA/COPPA protections and is more appropriate for educational use.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-10"
  },
  {
    toolName: "Grammarly",
    vendorName: "Grammarly Inc.",
    grade: "B",
    privacyScore: 68,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "13+",
    dataTypes: ["text content", "account data", "usage data"],
    summary: "Grammarly collects written content to provide suggestions but does not sell data to third parties. Grammarly for Education has additional protections. Data is processed on Grammarly's servers. Overall a relatively low-risk tool for secondary school use with appropriate data handling controls.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-09"
  },
  {
    toolName: "Duolingo",
    vendorName: "Duolingo Inc.",
    grade: "B",
    privacyScore: 72,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "13+ (Duolingo for Schools: any age with teacher oversight)",
    dataTypes: ["learning progress", "account data", "usage data"],
    summary: "Duolingo for Schools provides teacher controls and does not show advertising to students. The platform collects learning progress data to personalise lessons. Generally considered appropriate for educational use with teacher oversight.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-08"
  },
  {
    toolName: "Khan Academy",
    vendorName: "Khan Academy",
    grade: "A",
    privacyScore: 88,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages",
    dataTypes: ["learning progress", "account data"],
    summary: "Khan Academy is a non-profit with strong privacy practices. It collects only the data necessary to deliver personalised learning. No advertising, no data selling, COPPA compliant, and FERPA compliant. Khanmigo (AI tutor) has additional safety guidelines specifically designed for student use.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-11"
  },
  {
    toolName: "Canva",
    vendorName: "Canva Pty Ltd",
    grade: "B",
    privacyScore: 71,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "13+ (Canva for Education: any age with teacher oversight)",
    dataTypes: ["created content", "account data", "usage data"],
    summary: "Canva for Education provides free access with teacher controls and does not show advertising to students. Content created by students is stored on Canva servers. Generally appropriate for school use. AI Magic features have separate data handling considerations.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-10"
  },
  {
    toolName: "Quizlet",
    vendorName: "Quizlet Inc.",
    grade: "C",
    privacyScore: 55,
    collectsData: true,
    sharesDataWithThirdParties: true,
    hasDPA: true,
    ageRating: "13+",
    dataTypes: ["study content", "account data", "usage data", "advertising identifiers"],
    summary: "Quizlet collects data including advertising identifiers and shares data with third-party advertising partners on the free tier. The teacher-managed version reduces data sharing. AI features (Quizlet Q-Chat) are not available to users under 18.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-07"
  },
  {
    toolName: "Kahoot",
    vendorName: "Kahoot! AS",
    grade: "B",
    privacyScore: 66,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages with teacher oversight",
    dataTypes: ["quiz responses", "account data", "usage data"],
    summary: "Kahoot collects quiz response data and usage data. The school version does not require students to create personal accounts (can participate with a nickname). GDPR compliant and provides DPA for schools. Generally considered appropriate for classroom use.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-09"
  },
  {
    toolName: "Seesaw",
    vendorName: "Seesaw Learning",
    grade: "A",
    privacyScore: 84,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages",
    dataTypes: ["portfolio content", "account data", "usage data"],
    summary: "Seesaw is designed specifically for K-12 education. Strong privacy practices, no advertising, COPPA and FERPA compliant. Student data is not sold or used for advertising. DPA available. Widely used in primary schools with good family communication features.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-11"
  },
  {
    toolName: "Adobe Express",
    vendorName: "Adobe Inc.",
    grade: "C",
    privacyScore: 58,
    collectsData: true,
    sharesDataWithThirdParties: true,
    hasDPA: true,
    ageRating: "13+",
    dataTypes: ["created content", "account data", "usage data", "Adobe Analytics"],
    summary: "Adobe Express for Education provides school-appropriate controls, but the platform uses Adobe Analytics and may share usage data. The free tier collects more data than the Education version. AI-generated content features require careful consideration of intellectual property and data use.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-08"
  },
  {
    toolName: "Microsoft Copilot",
    vendorName: "Microsoft",
    grade: "B",
    privacyScore: 74,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "13+ (Education versions: any age with appropriate controls)",
    dataTypes: ["conversation history", "account data", "Microsoft 365 activity"],
    summary: "Microsoft Copilot for Education (M365 Education tenants) has enterprise-grade privacy protections. Data is not used to train base models when accessed via the education tenant. A Data Processing Agreement is available through the Microsoft Products and Services Agreement. Appropriate for secondary school use in an M365 education environment.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-10"
  },
  {
    toolName: "Google Workspace for Education",
    vendorName: "Google",
    grade: "A",
    privacyScore: 82,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages with school administration",
    dataTypes: ["documents", "email", "calendar", "usage data"],
    summary: "Google Workspace for Education (formerly G Suite) is FERPA and COPPA compliant. Google does not use student data for advertising. DPA available via the Google Workspace for Education agreement. Strong audit and admin controls. One of the most widely deployed educational platforms in UK schools.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-11"
  },
  {
    toolName: "Notion AI",
    vendorName: "Notion Labs Inc.",
    grade: "C",
    privacyScore: 54,
    collectsData: true,
    sharesDataWithThirdParties: true,
    hasDPA: true,
    ageRating: "13+",
    dataTypes: ["document content", "account data", "usage data", "AI query logs", "third-party analytics"],
    summary: "Notion AI processes document content and AI queries through third-party AI providers (OpenAI), adding an extra data handling layer. Notion uses third-party analytics tools and collects usage data. The education pricing tier includes a DPA, but the underlying AI processing route means student work may pass through multiple data processors. Not recommended for use with personal or sensitive student data without a detailed review of the sub-processor chain.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-10"
  },
  {
    toolName: "BrainPOP",
    vendorName: "BrainPOP",
    grade: "B",
    privacyScore: 73,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages with teacher oversight",
    dataTypes: ["learning progress", "quiz results", "account data"],
    summary: "BrainPOP is purpose-built for K-12 education. Does not sell student data or display advertising to students. School licensing includes a DPA. COPPA and FERPA compliant. Learning progress data is used only to personalise content within the platform. One of the more privacy-friendly AI-assisted learning platforms for primary and secondary use.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-09"
  },
  {
    toolName: "Nearpod",
    vendorName: "Nearpod Inc.",
    grade: "B",
    privacyScore: 69,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages with teacher oversight",
    dataTypes: ["student responses", "learning progress", "account data"],
    summary: "Nearpod is a classroom engagement and interactive lesson platform. Student response data is collected for teacher-facing analytics. No advertising shown to students. DPA available for school accounts. FERPA and COPPA compliant. Data is stored in the US — UK schools should verify that the school's DPA covers international data transfers under GDPR Chapter V before deployment.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-08"
  },
  {
    toolName: "Google Classroom",
    vendorName: "Google",
    grade: "A",
    privacyScore: 86,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages under school administration",
    dataTypes: ["assignments", "grades", "course materials", "account data"],
    summary: "Google Classroom is part of Google Workspace for Education and inherits its strong privacy protections. FERPA and COPPA compliant. Google does not use Classroom data for advertising. DPA available through the Google Workspace for Education agreement. Widely used across UK primary and secondary schools. Teachers and admins have strong controls over class membership and data access.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-11"
  },
  {
    toolName: "Microsoft Teams for Education",
    vendorName: "Microsoft",
    grade: "A",
    privacyScore: 85,
    collectsData: true,
    sharesDataWithThirdParties: false,
    hasDPA: true,
    ageRating: "All ages under school administration",
    dataTypes: ["messages", "files", "meeting recordings", "assignments", "account data"],
    summary: "Microsoft Teams for Education is part of Microsoft 365 Education and carries enterprise-grade privacy protections. FERPA, COPPA, and GDPR compliant. Data is not used to train base Microsoft AI models in education tenants. DPA available via the Microsoft Products and Services Agreement. Strong audit logs, admin controls, and multi-factor authentication support. Widely deployed across UK secondary schools and colleges.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-11"
  },
  {
    toolName: "Turnitin",
    vendorName: "Turnitin LLC",
    grade: "D",
    privacyScore: 42,
    collectsData: true,
    sharesDataWithThirdParties: true,
    hasDPA: true,
    ageRating: "13+ (primarily HE/FE; secondary schools require teacher control)",
    dataTypes: ["submitted student work", "writing metadata", "account data", "similarity fingerprints"],
    summary: "Turnitin permanently retains submitted student work in its global database for plagiarism detection. Student-authored work becomes part of the comparison corpus without an opt-out mechanism. There are unresolved concerns about whether submitted work may be used in AI-generated text detection model training. The EU AI Act may classify AI-generated content detection as a high-risk AI system in educational contexts. Schools must ensure a DPA is in place, students are informed of permanent retention, and the school's legitimate interest basis for processing is documented. Not recommended for use with students under 16 without explicit parental notification and DPO sign-off.",
    source: "Common Sense Media EdTech Privacy",
    lastReviewed: "2024-10"
  }
];

export function lookupRating(toolName: string): VendorRating | null {
  const normalised = toolName.toLowerCase().trim();
  return RATINGS.find(r =>
    r.toolName.toLowerCase() === normalised ||
    r.toolName.toLowerCase().includes(normalised) ||
    normalised.includes(r.toolName.toLowerCase())
  ) ?? null;
}

export function getAllRatings(): VendorRating[] {
  return RATINGS;
}
