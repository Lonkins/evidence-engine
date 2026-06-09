# AI Tool Risk Assessment Framework for Schools and Educational Institutions
> Source material: NIST AI RMF 1.0 (nist.gov/artificial-intelligence), ICO AI guidance (ico.org.uk),
> ICO Children's Code / Age Appropriate Design Code (ico.org.uk/for-organisations/childrens-code),
> UK Data Protection Act 2018, UK GDPR, EU AI Act 2024 (Regulation (EU) 2024/1689),
> OWASP Top 10 for Large Language Model Applications (owasp.org/www-project-top-10-for-large-language-model-applications).
> This document is for educational and demonstration purposes. Always verify against current published
> versions before making institutional decisions.

---

## Part 1: NIST AI Risk Management Framework (AI RMF 1.0)

The NIST AI RMF provides a voluntary, flexible framework for managing AI risks. It consists of four
core functions: GOVERN, MAP, MEASURE, MANAGE. Sub-category codes (e.g. GOVERN 1.1) are from
the AI RMF Playbook and are directly citable in assessment justifications.

### Function 1: GOVERN

GOVERN establishes organisational accountability for AI risk management (GOVERN 1.1–6.2).
For a school evaluating an AI tool, the relevant sub-categories are:

- **GOVERN 1.1** — Policies, processes, and procedures for AI risk management are documented
- **GOVERN 1.2** — Accountability mechanisms for AI risk decisions are established and communicated
- **GOVERN 1.4** — Teams with diverse skills are engaged for AI risk documentation
- **GOVERN 4.1** — AI risk and benefits are communicated to affected parties
- **GOVERN 4.2** — Internal transparency about AI development and deployment is maintained
- **GOVERN 5.1** — Organisational policies for AI risk management are applied to procurement

**Key GOVERN questions for schools:**
- Does the vendor have a published responsible AI policy traceable to GOVERN 1.1?
- Is there a named data protection contact (GOVERN 1.2)?
- Has the vendor undergone independent AI audits (GOVERN 4.2)?
- Does the vendor provide model cards or datasheets (GOVERN 4.1)?

**Red flags (GOVERN failures):**
- No published DPO or data protection contact
- Privacy policy explicitly excludes AI-specific data use from GDPR obligations
- Vendor headquartered in non-adequate jurisdiction without Standard Contractual Clauses

---

### Function 2: MAP

MAP identifies AI risks in context (MAP 1.1–5.2). Critical sub-categories:

- **MAP 1.1** — Context is established for the AI risk assessment (who, what, where, how)
- **MAP 1.5** — Organisational risk tolerances are determined and documented
- **MAP 2.1** — Evidence-based methods are applied to identify potential harms
- **MAP 2.2** — Scientific basis is identified for expected benefits and potential harms
- **MAP 3.5** — Likelihood and magnitude of harm impact are estimated
- **MAP 5.1** — Likelihood of undesirable outcomes from user interaction is assessed

**For school AI tool evaluation, MAP means asking:**

About the AI system:
- What type of AI is this? (generative text, image recognition, recommendation system, adaptive learning)
- What data does it collect from students? (keystrokes, voice, behavioural patterns, academic performance)
- Does it make or influence decisions about students? (grading, content selection, behaviour flagging)
- Is the model trained on student data? If so, how and where?

About the deployment context:
- What age group will use this tool? (Under-13 triggers COPPA; under-18 triggers Children's Code)
- Will students use it directly, or will teachers use it on their behalf?
- What M365 or school system data does it access?
- Does it integrate with undisclosed third-party services?

Risk categories for schools (MAP 3.5):
- **Data risk**: Student PII transmitted to third-party servers
- **Behavioural profiling risk**: Tool builds individual profiles of student behaviour, attention, or mood
- **Discriminatory output risk**: AI produces different quality outputs for different demographic groups
- **Manipulation risk**: Persuasive or addictive design patterns targeted at minors
- **Over-reliance risk**: Students or teachers defer to AI output without critical evaluation

---

### Function 3: MEASURE

MEASURE analyses and assesses identified risks (MEASURE 1.1–4.2). Critical sub-categories:

- **MEASURE 2.5** — AI system is evaluated for bias across demographic groups
- **MEASURE 2.6** — AI system output is evaluated for fairness implications
- **MEASURE 2.7** — AI system development and deployment is documented for audit
- **MEASURE 2.10** — Privacy risk associated with the AI system is assessed
- **MEASURE 4.1** — Measurement approaches for AI risks are applied to evaluation results

**RiskRadar scoring dimensions (each scored 1–5):**

#### Dimension 1: Data Privacy
*Primary citations: MEASURE 2.10, MAP 2.1, GOVERN 1.2*

| Score | Criteria | Evidentiary Anchor |
|-------|----------|--------------------|
| 5 (Minimal Risk) | No student PII collected; data processed locally or anonymised at source; explicit GDPR Article 6 lawful basis documented; data never leaves UK/EU | Signed DPA + data flow diagram showing no personal data transmitted |
| 4 | Anonymised or pseudonymised data only; no individual profiles; UK/EU data residency confirmed; DPA in place; clear retention schedule | DPA signed, data residency clause confirmed, retention policy documented |
| 3 | Named student data collected but limited (name + year group only); clear retention policy; DPA signed and available; data not used for model training | DPA signed; school can confirm data not used for training; retention ≤ academic year |
| 2 | Student PII transmitted to third-party servers; unclear retention; DPA template not yet available; data may be used for model training | No signed DPA; privacy policy ambiguous on training data use |
| 1 (Critical Risk) | Student biometric or sensitive data (health, SEND status) collected; no EU/UK adequacy; no DPA; transfers to high-risk jurisdictions without SCCs | Documented transfer to non-adequate country without SCCs in privacy policy |

#### Dimension 2: Age Appropriateness
*Primary citations: MAP 1.1, MAP 5.1, ICO Children's Code Standards 1, 4, 7, 9, 12, 13*

| Score | Criteria | Evidentiary Anchor |
|-------|----------|--------------------|
| 5 (Minimal Risk) | Tool designed specifically for the target age group; ICO Children's Code compliant across all 15 standards; no advertising; default settings maximally protective | Vendor publishes Children's Code compliance statement with standard-by-standard mapping |
| 4 | Age-appropriate settings exist and are on by default (Standard 7); COPPA/GDPR-K compliant; no nudge techniques (Standard 13); geolocation off by default (Standard 10) | Evidence of default-protective settings in UI; vendor compliance documentation for Standards 4, 7, 13 |
| 3 | Adult tool with dedicated school/education mode; reduced data collection in education mode; no advertising in education mode; parental controls available (Standard 11) | Vendor-documented education mode feature list; confirmation that student data not used for ad targeting |
| 2 | Adult tool used with children without specific safeguards; default settings not age-appropriate; requires manual configuration to achieve compliance; Standard 7 not met | Default settings allow profiling, advertising, or data sharing; school must manually restrict |
| 1 (Critical Risk) | Adult content risk; behavioural advertising targeting minors (Standard 5); no age verification; nudge techniques present (Standard 13); social scoring characteristics | Evidence of ad-targeting of minors; documented engagement manipulation patterns |

#### Dimension 3: Transparency and Explainability
*Primary citations: GOVERN 4.1, MEASURE 2.7, EU AI Act Article 50, MEASURE 2.2*

| Score | Criteria | Evidentiary Anchor |
|-------|----------|--------------------|
| 5 (Minimal Risk) | Full model card published; human review available for all AI-influenced decisions; clear "this is AI" labelling at every interaction point; audit log available | Published model card URL; UI screenshot showing AI disclosure; audit log documentation |
| 4 | Explanation available for AI-influenced outputs; users can query the basis for recommendations; AI use clearly disclosed; EU AI Act Article 50 transparency met | Vendor documentation showing explanation mechanism; user-facing disclosure confirmed |
| 3 | General AI disclosure present in terms of service and UI; limited explanation for specific outputs; Article 50 disclosure present but not prominently surfaced | Terms of service AI disclosure confirmed; no in-line output explanation mechanism |
| 2 | AI use disclosed in privacy policy only, not at point of interaction; outputs presented without explanation or indication of AI involvement | Privacy policy mentions AI but UI provides no indication; no explanation mechanism |
| 1 (Critical Risk) | No disclosure that AI is used; AI decisions presented as factual without transparency; EU AI Act Article 50 violated; outputs indistinguishable from human | No mention of AI in privacy policy, UI, or terms; opaque decision-making |

#### Dimension 4: Bias and Fairness
*Primary citations: MEASURE 2.5, MEASURE 2.6, MAP 2.2, GOVERN 5.2*

| Score | Criteria | Evidentiary Anchor |
|-------|----------|--------------------|
| 5 (Minimal Risk) | Published bias testing across protected characteristics (race, gender, disability, socioeconomic status); regular independent audits; documented remediation process; GOVERN 5.2 diversity in teams | Published bias evaluation report with demographic breakdown; named remediation process |
| 4 | Bias testing conducted; results partially published; complaints mechanism exists; specific protected characteristics tested | System card or safety report with partial demographic data; complaints process documented |
| 3 | Vendor claims fairness testing but no published results; standard safety evaluation conducted; no documented issues | Vendor statement of bias testing without published data; no known reported issues |
| 2 | No public evidence of bias testing; known or reported issues with certain demographic groups; no complaints process | No safety evaluation documentation; community reports of differential quality outputs |
| 1 (Critical Risk) | Documented bias complaints upheld; tool produces demonstrably unequal outputs by protected characteristic; regulatory action taken | Published regulatory findings; documented unequal outcomes by race, gender, or disability |

#### Dimension 5: Vendor Accountability
*Primary citations: GOVERN 1.2, GOVERN 1.4, MANAGE 2.2, MANAGE 3.1*

| Score | Criteria | Evidentiary Anchor |
|-------|----------|--------------------|
| 5 (Minimal Risk) | ISO 27001 certified; SOC 2 Type II; published breach notification history; named DPO; SLA with educational institutions; MANAGE 3.1 ongoing monitoring in place | Certificates publicly listed; breach history reviewed; DPO contact confirmed; SLA reviewed |
| 4 | Recognised security certification (ISO 27001 or SOC 2); clear breach notification process (72-hour GDPR requirement met); named security contact; SLA available | Certification verified; breach process documented in privacy policy; SLA terms available |
| 3 | Basic security documentation available; privacy policy adequate; responds to DPA and DPIA queries within reasonable timeframe; no known breaches | Privacy policy reviewed and adequate; DPA request submitted and signed |
| 2 | Minimal security documentation; no SLA; slow or unclear breach notification process; DPA requests not responded to promptly | No published certifications; DPA request unanswered after 10 working days |
| 1 (Critical Risk) | No security certification; history of data breaches or regulatory action (ICO enforcement); unresponsive to data subject rights requests | ICO enforcement notice or fine recorded; public breach affecting student data |

**Overall risk calculation:**
- Total score 21–25: **Low Risk** — approve with standard annual review
- Total score 15–20: **Medium Risk** — approve with controls; review in 6 months
- Total score 8–14: **High Risk** — escalate to DPO; do not deploy without agreed mitigations
- Total score 5–7: **Critical Risk** — do not deploy; notify governing body; review GDPR obligations if already in use

---

### Function 4: MANAGE

MANAGE treats identified risks (MANAGE 1.1–4.1). Critical sub-categories:

- **MANAGE 1.1** — A risk treatment plan is documented for each identified AI risk
- **MANAGE 1.3** — Responses to AI risks are prioritised by likelihood and magnitude
- **MANAGE 2.2** — Mechanisms are in place to implement and monitor risk responses
- **MANAGE 3.1** — AI risks are monitored on an ongoing basis post-deployment
- **MANAGE 4.1** — Post-deployment beneficial use and risk are evaluated

**Decision outcomes for school AI tool assessment:**

**Approved (Low Risk, 21–25):**
- Add to Approved Tools registry via `saveAssessment` MCP tool
- Set review date: 12 months or on vendor policy change (re-assessment trigger)
- Generate AUP clause for inclusion in school AI use policy

**Approved with Controls (Medium Risk, 15–20):**
- Specify required mitigations (e.g. teacher oversight required; no direct student access to certain features; data minimisation settings enabled)
- Document controls in assessment record (MANAGE 1.1)
- Set review date: 6 months
- Notify DPO; obtain DPO sign-off before deployment
- Require vendor DPA if not yet signed

**Not Approved (High Risk, 8–14):**
- Record in assessment registry with "Not Approved" status
- Notify requesting teacher with written explanation citing specific dimension failures
- Flag for DPO review (MANAGE 1.3)
- Suggest lower-risk alternative where possible

**Critical — Escalate (5–7):**
- Immediate notification to headteacher and DPO
- If already deployed: initiate GDPR incident review (MANAGE 4.1)
- Review ICO breach notification obligations (72-hour threshold)
- Document incident if tool already in use

---

## Part 2: ICO Guidance on AI in Education

The Information Commissioner's Office (ICO) is the UK's independent data protection authority.

### ICO AI Auditing Framework

The ICO AI auditing framework examines AI systems across six areas:
1. **Accountability and governance** — who is responsible for AI decisions
2. **Risk management** — how AI risks are identified and treated
3. **Data protection by design** — data minimisation, storage limitation, purpose limitation
4. **Transparency** — being clear with individuals about how AI is used
5. **Fairness** — non-discrimination, human review of significant decisions
6. **Data subject rights** — enabling access, rectification, erasure

**Critical ICO requirements for schools:**
- Any AI that makes or influences decisions about identifiable students requires a **Data Protection Impact Assessment (DPIA)** under Article 35 GDPR before deployment
- Students (or parents/guardians for under-13s) must be informed when AI is used in ways that affect them — this is a transparency obligation under Article 13/14 GDPR
- Schools must demonstrate human oversight of AI-assisted decisions about students
- Data shared with AI vendors must be governed by a signed **Data Processing Agreement (DPA)** under Article 28 GDPR

---

### ICO Children's Code — Age Appropriate Design Code (All 15 Standards)

The Children's Code applies to any online service likely to be accessed by under-18s in the UK.
Published 2020, came into force September 2021. All 15 standards must be assessed:

| Standard | Name | Key Requirement |
|----------|------|-----------------|
| **Standard 1** | Best interests of the child | The best interests of the child must be a primary consideration in all design decisions |
| **Standard 2** | Data protection impact assessments | A DPIA must be completed before deploying any service likely to be accessed by children |
| **Standard 3** | Age appropriate application | If age cannot be verified, the service must default to child-protective settings for all users |
| **Standard 4** | Transparency | Privacy information must be in plain language appropriate for the age of the child |
| **Standard 5** | Detrimental use of data | Data must not be used in ways that are detrimental to the wellbeing of the child |
| **Standard 6** | Policies and community standards | Published policies must be upheld and enforced consistently |
| **Standard 7** | Default settings | Privacy settings must be set to the most protective option by default — no opt-out required for protection |
| **Standard 8** | Data minimisation | Only data strictly necessary for the service must be collected; no speculative data collection |
| **Standard 9** | Data sharing | Data must not be shared with third parties unless strictly necessary; no advertising profiling |
| **Standard 10** | Geolocation | Geolocation services must be switched off by default; precise location must not be shared |
| **Standard 11** | Parental controls | Parental controls must be provided for services likely to be used by under-13s |
| **Standard 12** | Profiling | Profiling of children must be off by default; only turned on where compelling justification exists |
| **Standard 13** | Nudge techniques | Nudge techniques (dark patterns, social proof, streaks, badges) must not be used to encourage children to share more data or weaken privacy settings |
| **Standard 14** | Connected toys and devices | Data collected by connected devices used by children must be protected with specific controls |
| **Standard 15** | Online tools | Tools must be provided for children and parents to exercise data rights in a child-appropriate way |

**Assessment implication:** A tool that passes standard adult GDPR checks may still fail multiple
Children's Code standards. Standards 7, 8, 9, 12, and 13 are the most commonly failed by
adult-oriented AI tools repurposed for school use.

---

## Part 3: EU AI Act (2024) — School Implications

The EU AI Act (Regulation (EU) 2024/1689) classifies AI systems by risk. Three categories apply to schools.

### Prohibited AI Practices (Article 5)

The following practices are **banned outright** and must trigger an immediate Critical risk rating:

- **Article 5(1)(a)** — AI systems that deploy subliminal techniques beyond a person's consciousness to materially distort behaviour in a manner causing or likely to cause harm
- **Article 5(1)(b)** — AI systems that exploit vulnerabilities of specific groups due to age, disability, or social/economic situation to distort behaviour causing or likely to cause harm *(directly applies to AI tools used with children)*
- **Article 5(1)(c)** — Social scoring systems that evaluate or classify individuals based on social behaviour or personal characteristics in unrelated contexts
- **Article 5(1)(d)** — Real-time remote biometric identification systems in publicly accessible spaces *(except narrow law enforcement exceptions)*
- **Article 5(1)(e)** — AI systems used to infer emotions in workplaces and educational institutions *(this directly prohibits attention-tracking, mood-recognition, and engagement-scoring tools in schools)*
- **Article 5(1)(f)** — Biometric categorisation systems that infer protected characteristics (race, political opinions, religion, sexual orientation)

**Assessment implication for schools:** Standard 5(1)(b) and 5(1)(e) are directly applicable.
Any tool using attention tracking, emotion recognition, engagement scoring, or engagement-optimising
design patterns in an educational context must be assessed against these provisions.
Score such tools at **Critical Risk (1–7 range)** on Dimensions 2 and 3 immediately.

### High-Risk AI Systems (Annex III)

Categories **high-risk** under the AI Act requiring conformity assessment before deployment:

- **Category 3 (Education and vocational training)**: AI used to determine access to educational institutions, assess students, evaluate learning outcomes, or monitor and detect prohibited student behaviour
- **Category 4 (Employment and worker management)**: AI used in recruitment, promotion, or performance evaluation of education staff

**For schools:** Any AI tool that affects academic assessments, grades, or access decisions is legally
high-risk under EU AI Act Annex III. High-risk tools must:
- Maintain risk management documentation throughout their lifecycle
- Implement human oversight mechanisms preventing full automation of decisions
- Achieve appropriate accuracy, robustness, and cybersecurity levels
- Maintain detailed logs enabling post-hoc audit

### Transparency Obligations (Article 50)

- AI systems interacting with humans must **disclose they are AI** at the point of interaction (Article 50(1))
- AI-generated content (text, images, audio, video) must be **machine-readable labelled** as AI-generated (Article 50(2))

**Assessment implication:** Any AI chatbot deployed to students must identify itself as AI at first
interaction. Tools that generate content students could submit as their own work without disclosure
mechanisms fail Article 50 and must score 2 or below on Dimension 3 (Transparency).

---

## Part 4: Sample Risk Assessment Conversation Flow

**Step 1 — Tool identification**
"What is the name of the AI tool you want to assess, and what does it do?"

**Step 2 — Deployment context**
"Who will use this tool — students directly, teachers, or both? What age group?"

**Step 3 — Data handling**
"Does the tool require students to create accounts? What data does it ask for or collect?"

**Step 4 — Vendor verification**
"Is there a Data Processing Agreement (DPA) available from the vendor? Do they have a published privacy policy and named DPO?"

**Step 5 — Decision-making impact**
"Will this tool influence grading, assessment, or any formal decision about students?"

**Step 6 — Current approval status**
"Has this tool been assessed or approved before at your school?"

**Agent then:**
- Scores each of the 5 dimensions based on responses
- Cites specific NIST AI RMF sub-categories, ICO Children's Code standards, and EU AI Act articles to justify scores
- Generates overall risk rating (Low / Medium / High / Critical)
- Calls `saveAssessment` MCP tool to write to SharePoint registry
- If approved: generates suggested AUP policy clause
- Sets review date and re-assessment trigger conditions
- Explicitly states: this assessment supports human judgment — it does not replace DPO sign-off

---

## Part 5: Sample Scored Assessment — ChatGPT (OpenAI)

*This is a worked example of RiskRadar scoring a widely-known tool. It demonstrates how the
5-dimension rubric, NIST AI RMF sub-categories, ICO Children's Code standards, and EU AI Act
articles are cited together in a complete assessment.*

**Tool:** ChatGPT (OpenAI, consumer tier with Education settings available)
**Assessed for:** Secondary school deployment, students aged 11–16, direct student access

---

**Dimension 1: Data Privacy — Score: 3**
*Framework: MEASURE 2.10, MAP 2.1*

Justification: Conversation data is transmitted to OpenAI servers in the US (non-EU/UK jurisdiction).
A DPA is available for OpenAI Enterprise but not for the consumer/free tier. On the default consumer
tier, conversation history may be used to improve models unless explicitly opted out by the user.
Named student data (via account registration) is collected. A signed DPA is achievable at Enterprise
tier, which would satisfy the evidentiary anchor for a score of 3: "named student data collected but
limited; clear retention policy; DPA signed."

Score 4 would require: confirmed UK/EU data residency, which OpenAI currently offers in Enterprise
with EU data residency add-on (at additional cost not available to most schools).

---

**Dimension 2: Age Appropriateness — Score: 2**
*Framework: MAP 5.1, ICO Children's Code Standards 7, 12, 13*

Justification: The default consumer tier does not meet Children's Code Standard 7 (default protective
settings) — conversation history is on by default, profiling for model improvement is enabled by
default, and age verification is not systematically enforced. Standard 12 (profiling off by default)
is not met: OpenAI's default settings allow training on user data. Standard 13 (no nudge techniques)
is partially failed: the product design encourages continued engagement through conversation history
and suggested prompts. An education-specific tier (ChatGPT Edu) improves several of these, but
requires separate procurement and contract.

Score 3 would require: confirmed enrollment in ChatGPT Edu with documented education-mode
restrictions applied at the account level, not just available as options.

---

**Dimension 3: Transparency and Explainability — Score: 4**
*Framework: GOVERN 4.1, MEASURE 2.7, EU AI Act Article 50*

Justification: ChatGPT clearly identifies itself as an AI at every interaction point (Article 50(1)
met). OpenAI publishes detailed model cards and system cards for GPT-4o. Explanation for most
outputs is available via follow-up questions. Published usage policies are clear and accessible.
The EU AI Act Article 50 transparency requirement is fully met.

Score 5 would require: human review available for all AI-influenced decisions, which is not
applicable to a general-purpose chatbot.

---

**Dimension 4: Bias and Fairness — Score: 3**
*Framework: MEASURE 2.5, MEASURE 2.6*

Justification: OpenAI publishes system cards and safety evaluations for GPT-4o that include
bias evaluation methodology. Results are partially published (high-level pass/fail for major
categories). No comprehensive demographic-specific performance breakdown is publicly available.
No known upheld regulatory complaints. Documented inconsistencies in some demographic-adjacent
domains (non-English languages, regional knowledge) acknowledged by vendor.

Score 4 would require: published results with demographic breakdown showing specific groups tested
and pass/fail thresholds.

---

**Dimension 5: Vendor Accountability — Score: 4**
*Framework: GOVERN 1.2, MANAGE 2.2, MANAGE 3.1*

Justification: OpenAI holds SOC 2 Type II certification and ISO 27001 certification (as of 2024).
Breach notification process is documented and consistent with GDPR 72-hour requirement. Named
security contacts are available for Enterprise customers. SLA is available on Enterprise tier.
MANAGE 3.1 (ongoing monitoring) is supported by the Trust Portal and audit log features.

Score 5 would require: published breach notification history and a DPO specifically named in the
UK-jurisdiction privacy policy.

---

**Total Score: 3 + 2 + 4 + 3 + 4 = 16 → Medium Risk**

**Decision: Approved with Controls**

**Required controls:**
1. All student use must be via ChatGPT Edu or equivalent education tier with documented DPA signed
2. Teacher-supervised use only — no unsupervised independent use for assessments
3. Students must not enter sensitive personal information (SEND status, medical details, home address)
4. Academic integrity disclosure required: any AI-assisted work must be declared
5. Data minimisation: conversation history should be cleared at end of session if not using Enterprise tier
6. DPO sign-off required before school-wide deployment; individual teacher pilots at low risk

**Review date:** 6 months from assessment date, or immediately on any OpenAI privacy policy change.

**Re-assessment triggers:** Change to training data use policy; introduction of new data collection features; any ICO enforcement action against OpenAI; change in US-UK data transfer legal basis.

**Suggested AUP clause:**
> Students may use ChatGPT for supervised learning support only. Students must not enter personal information about themselves or others, including health information, home addresses, or information about other students. All AI-assisted work must be clearly disclosed in academic submissions. The school uses ChatGPT under a Data Processing Agreement and [Education tier name]; the consumer tier must not be used for school work. This approval is limited to [approved use case] and must not be extended without reassessment.

**Human-in-the-loop note:** This assessment is produced by RiskRadar as a structured input to
human decision-making. Deployment approval must be confirmed by the school DPO or designated
responsible lead. RiskRadar does not make deployment decisions — it provides evidence-based
assessment to support them.

---

## Part 6: NIST AI RMF Sub-category Quick Reference

Quick mapping of RiskRadar's 5 scoring dimensions to the NIST AI RMF sub-categories that
each dimension primarily tests. Cite these sub-category IDs when justifying scores.

| Scoring Dimension | Primary Sub-categories | What They Test |
|-------------------|----------------------|----------------|
| Data Privacy | MEASURE 2.10, MAP 2.1, GOVERN 1.2 | Privacy risk assessment, evidence-based harm identification, accountability for data decisions |
| Age Appropriateness | MAP 1.1, MAP 5.1, MAP 3.5 | Context establishment, user interaction risk, likelihood and magnitude of harm to children |
| Transparency | GOVERN 4.1, GOVERN 4.2, MEASURE 2.7 | Communication of risk/benefit, internal transparency, documentation for audit |
| Bias and Fairness | MEASURE 2.5, MEASURE 2.6, MAP 2.2, GOVERN 5.2 | Bias evaluation, fairness evaluation, scientific basis, diverse team engagement |
| Vendor Accountability | GOVERN 1.2, GOVERN 1.4, MANAGE 2.2, MANAGE 3.1 | Accountability mechanisms, team capability, risk response mechanisms, ongoing monitoring |

**Full NIST AI RMF documentation:** https://airc.nist.gov/RMF/Overview
**AI RMF Playbook (sub-category detail):** https://airc.nist.gov/Docs/2
