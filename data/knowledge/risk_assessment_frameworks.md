# AI Tool Risk Assessment Framework for Schools and Educational Institutions
> Source material: NIST AI RMF (public, nist.gov/artificial-intelligence), ICO AI guidance (public, ico.org.uk),
> UK Data Protection Act 2018, GDPR, EU AI Act 2024, Children's Code (Age Appropriate Design Code).
> This document is for educational and demonstration purposes only. Always verify against the
> current published versions of these frameworks before making institutional decisions.

---

## Part 1: NIST AI Risk Management Framework (AI RMF 1.0)

The NIST AI RMF provides a voluntary, flexible framework for managing risks to individuals and
organisations from AI systems. It consists of four core functions: GOVERN, MAP, MEASURE, MANAGE.

### Function 1: GOVERN

GOVERN establishes the organisational context for AI risk management — policies, accountability,
and culture. For a school evaluating an AI tool:

**Key questions:**
- Does the vendor have a published AI ethics or responsible AI policy?
- Is there a named contact for AI safety and data protection queries?
- Has the vendor undergone independent AI audits or impact assessments?
- Does the vendor provide transparency documentation (model cards, datasheets)?
- Is the vendor accountable under a recognised legal jurisdiction?

**Red flags:**
- No published data protection contact or DPO
- Privacy policy written to exclude AI-specific data use from normal GDPR obligations
- Vendor headquartered in a jurisdiction without EU/UK adequacy decision and no SCCs in place

---

### Function 2: MAP

MAP identifies AI risks in context — who is affected, what the system does, and what could go wrong.

**For school AI tool evaluation, MAP means asking:**

**About the AI system itself:**
- What type of AI is this? (generative text, image recognition, recommendation system, adaptive learning, etc.)
- What data does it collect from students? (keystrokes, voice, behavioural patterns, academic performance)
- Does it make or influence decisions about students? (grading, content selection, flagging behaviour)
- Is the model trained on student data? If so, how and where?

**About the deployment context:**
- What age group will use this tool? (Under-13 triggers COPPA; under-18 triggers Children's Code)
- Will students use it directly, or will teachers use it on their behalf?
- What M365 or school system data does it access? (Teams, OneDrive, email, SharePoint)
- Does it integrate with third-party services not covered in the main privacy policy?

**Risk categories for schools:**
- **Data risk**: Student PII (name, age, school, location, performance) transmitted to third-party servers
- **Behavioural profiling risk**: Tool builds individual profiles of student behaviour, attention, or mood
- **Discriminatory output risk**: AI produces different quality outputs for different demographic groups
- **Manipulation risk**: Persuasive or addictive design patterns targeted at minors
- **Over-reliance risk**: Students or teachers defer to AI output without critical evaluation

---

### Function 3: MEASURE

MEASURE analyses and assesses identified risks. For a school IT admin, this means scoring each
risk category to produce an overall risk level.

**RiskRadar scoring dimensions (each scored 1–5):**

#### Dimension 1: Data Privacy (weight: high)

| Score | Criteria |
|-------|---------|
| 5 (Low Risk) | No student PII collected; data processed locally; explicit GDPR Article 6 lawful basis documented |
| 4 | Anonymised data only; no individual profiles; UK/EU data residency |
| 3 | Named student data collected but limited; clear retention policy; DPA signed |
| 2 | Student PII transmitted to third-party servers; unclear retention; no DPA template available |
| 1 (High Risk) | Student biometric or sensitive data collected; no EU/UK adequacy; no DPA; transfers to high-risk jurisdictions |

#### Dimension 2: Age Appropriateness (weight: high)

| Score | Criteria |
|-------|---------|
| 5 | Tool designed specifically for the target age group; Children's Code compliant; no advertising |
| 4 | Age-appropriate settings exist; COPPA/GDPR-K compliant; default privacy settings are protective |
| 3 | Adult tool with school/education mode; reduced data collection in education mode |
| 2 | Adult tool used with children without specific safeguards; default settings not age-appropriate |
| 1 (High Risk) | Adult content risk; behavioural advertising targeting minors; no age verification mechanism |

#### Dimension 3: Transparency and Explainability (weight: medium)

| Score | Criteria |
|-------|---------|
| 5 | Full model card published; human review available for all AI decisions; clear "this is AI" labelling |
| 4 | Explanation available for AI-influenced outputs; users can query the basis for recommendations |
| 3 | General AI disclosure present; limited explanation for specific outputs |
| 2 | AI use disclosed but outputs unexplained; no mechanism to query or override AI decisions |
| 1 (High Risk) | No disclosure that AI is used; AI decisions presented as factual without any transparency |

#### Dimension 4: Bias and Fairness (weight: medium)

| Score | Criteria |
|-------|---------|
| 5 | Published bias testing across demographic groups; regular audits; documented remediation process |
| 4 | Bias testing conducted; results partially published; complaints mechanism exists |
| 3 | Vendor claims fairness testing but no published results |
| 2 | No public evidence of bias testing; known issues with certain demographic groups |
| 1 (High Risk) | Documented bias complaints; tool produces demonstrably unequal outputs by race, gender, disability |

#### Dimension 5: Vendor Accountability (weight: medium)

| Score | Criteria |
|-------|---------|
| 5 | ISO 27001 certified; SOC 2 Type II; published breach notification record; named DPO |
| 4 | Recognised security certification; clear breach notification process; SLA available |
| 3 | Basic security documentation available; privacy policy adequate; responds to enquiries |
| 2 | Minimal security documentation; no SLA; slow or unclear breach response |
| 1 (High Risk) | No security certification; history of breaches or regulatory action; unresponsive to queries |

**Overall risk calculation:**
- Total score 21–25: **Low Risk** — recommend approval with standard monitoring
- Total score 15–20: **Medium Risk** — approve with additional controls documented
- Total score 8–14: **High Risk** — escalate to DPO; do not deploy without mitigations agreed
- Total score below 8: **Critical Risk** — do not deploy; notify governing body

---

### Function 4: MANAGE

MANAGE means treating identified risks — deciding whether to accept, mitigate, transfer, or avoid.

**Decision outcomes for school AI tool assessment:**

**Approved (Low Risk):**
- Add to Approved Tools registry
- Set review date (recommended: 12 months or on vendor policy change)
- Generate suggested AUP clause for inclusion in school AI policy

**Approved with Controls (Medium Risk):**
- Specify required mitigations (e.g., teacher oversight required; no student direct access; data minimisation settings enabled)
- Document controls in assessment record
- Set review date: 6 months
- Notify DPO

**Not Approved (High Risk):**
- Record in Blocked Tools registry
- Inform requesting teacher with explanation
- Flag for DPO review
- Suggest lower-risk alternative if available

**Critical — Escalate:**
- Immediate notification to headteacher and DPO
- Document incident if tool already in use
- Review GDPR breach notification obligations

---

## Part 2: ICO Guidance on AI in Education

The Information Commissioner's Office (ICO) is the UK's independent body for data protection.
Key guidance relevant to school AI tool deployment:

### ICO AI Auditing Framework

The ICO AI auditing framework examines AI systems across six areas:
1. **Accountability and governance** — who is responsible for AI decisions
2. **Risk management** — how AI risks are identified and treated
3. **Data protection by design** — data minimisation, storage limitation
4. **Transparency** — being clear with individuals about how AI is used
5. **Fairness** — non-discrimination, human review of significant decisions
6. **Data subject rights** — enabling access, rectification, erasure requests

**For school IT admins, the most critical ICO requirements are:**
- Any AI that makes or influences decisions about identifiable students requires a **Data Protection Impact Assessment (DPIA)** before deployment
- Students (or parents for under-13s) must be informed when AI is used in ways that affect them
- Schools must be able to demonstrate human oversight of any AI-assisted decisions about students
- Data shared with AI vendors must be governed by a signed **Data Processing Agreement (DPA)** under Article 28 GDPR

### Children's Code (Age Appropriate Design Code)

The ICO's Children's Code applies to any online service likely to be accessed by under-18s. Key standards:

- **Best interests of the child** must be the primary consideration
- **Data minimisation**: collect only data strictly necessary
- **No profiling by default** for children unless there is a compelling, demonstrable reason
- **No nudge techniques** or design patterns that encourage children to share more data
- **Geolocation off by default**
- **Parental controls** must be available for under-13s

**Practical implication for school AI tool assessment:**
Any AI tool used by students under 18 should be assessed against these standards, not just
standard adult GDPR requirements. A tool that passes standard GDPR checks may still fail
the Children's Code.

---

## Part 3: EU AI Act (2024) — School Implications

The EU AI Act classifies AI systems by risk level. Two categories are directly relevant to schools:

### Prohibited AI Practices (Article 5)

The following are **banned outright** in the EU and should not be deployed in UK schools:
- AI systems that use subliminal or manipulative techniques to influence behaviour
- AI systems that exploit vulnerabilities of specific groups (including age) to distort behaviour
- Social scoring systems that evaluate or classify individuals based on personal characteristics
- Real-time remote biometric identification in public spaces (with narrow exceptions)

**Assessment implication:** Any tool using emotional recognition, attention tracking, or
engagement scoring in ways that could constitute surveillance or social scoring is banned.

### High-Risk AI Systems (Annex III)

The following categories are **high-risk** under the AI Act and require conformity assessment:
- **AI in education**: tools that determine access to educational institutions or assess students
- **AI in employment**: tools used in recruitment, promotion, or performance evaluation

**For schools, this means:**
- Any AI tool that affects academic assessments, grades, or access decisions is high-risk
- High-risk tools must: maintain risk management documentation, have human oversight mechanisms,
  achieve appropriate accuracy and robustness levels, and maintain logs enabling audit

### Transparency Obligations (Article 50)

- AI systems that interact with humans must **disclose they are AI** at the point of interaction
- AI-generated content (text, images, audio, video) must be **labelled as AI-generated**

**Assessment implication:** Any AI chatbot or content tool deployed to students must clearly
identify itself as AI. Tools that allow students to submit AI-generated work as their own
without disclosure mechanisms fail this standard.

---

## Part 4: Sample Risk Assessment Conversation Flow

The following is a suggested conversation flow for the RiskRadar agent when evaluating a tool:

**Step 1 — Tool identification**
"What is the name of the AI tool you want to assess, and what does it do?"

**Step 2 — Deployment context**
"Who will use this tool — students directly, teachers, or both? What age group?"

**Step 3 — Data handling**
"Does the tool require students to create accounts? What data does it ask for or collect?"

**Step 4 — Vendor verification**
"Is there a Data Processing Agreement (DPA) available from the vendor? Do they have a published privacy policy?"

**Step 5 — Decision-making impact**
"Will this tool influence grading, assessment, or any formal decision about students?"

**Step 6 — Current approval status**
"Has this tool been assessed or approved before at your school?"

**Agent then:**
- Scores each of the 5 dimensions based on responses
- Generates overall risk rating (Low / Medium / High / Critical)
- Produces assessment record stored in SharePoint registry
- If approved: generates suggested AUP policy clause
- Sets review date and re-assessment trigger
