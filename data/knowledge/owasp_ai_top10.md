# OWASP Top 10 for Large Language Model Applications (2025)
> Source: OWASP Foundation — public documentation. Included for educational purposes only.

This document summarises the OWASP Top 10 risks for LLM-based applications. It is used
as a grounding knowledge source for AI security certification preparation in educational settings.

---

## LLM01: Prompt Injection

**Risk**: Attackers manipulate an LLM by crafting inputs that override the model's intended instructions.

**Types**:
- *Direct injection*: User directly crafts a prompt that hijacks the model's behaviour.
- *Indirect injection*: Malicious content in a document, webpage, or data source the model processes.

**Relevance for certifications**: SC-200, CompTIA Security+, AZ-500

**Key controls**:
- Validate and sanitise inputs before passing to the model.
- Use privilege-separated prompts (system vs user contexts).
- Apply output validation before acting on model responses.

---

## LLM02: Insecure Output Handling

**Risk**: The model's output is trusted and used without validation — leading to XSS, SQL injection, or command execution in downstream systems.

**Example**: A model generates JavaScript that is rendered directly in a browser without escaping.

**Relevance for certifications**: CompTIA Security+, SC-900

**Key controls**:
- Treat LLM output as untrusted user input.
- Encode or sanitise before rendering in UIs or databases.
- Never pass raw LLM output to a system shell.

---

## LLM03: Training Data Poisoning

**Risk**: Adversarial manipulation of training data to introduce backdoors, biases, or incorrect behaviours.

**Relevance for certifications**: AZ-500, SC-200

**Key controls**:
- Audit data provenance before training.
- Use anomaly detection on training datasets.
- Monitor model behaviour for unexpected pattern shifts post-training.

---

## LLM04: Model Denial of Service

**Risk**: Attackers send computationally expensive requests to exhaust model resources, causing availability failures.

**Relevance for certifications**: CompTIA Security+, AZ-500

**Key controls**:
- Rate limiting on inference endpoints.
- Request size and complexity caps.
- Monitor token usage per session.

---

## LLM05: Supply Chain Vulnerabilities

**Risk**: Compromised third-party models, datasets, plugins, or libraries introduced into the LLM pipeline.

**Relevance for certifications**: CompTIA Security+, SC-200

**Key controls**:
- Validate integrity of pre-trained models and datasets.
- Pin dependency versions and review before updates.
- Prefer models with a published security disclosure process.

---

## LLM06: Sensitive Information Disclosure

**Risk**: The model reveals confidential data from its training set or system prompt in responses.

**Relevance for certifications**: SC-900, SC-200, CompTIA Security+

**Key controls**:
- Avoid including sensitive data in prompts or training material.
- Implement output filtering for PII patterns.
- Use retrieval-augmented generation with permission-scoped data sources.

---

## LLM07: Insecure Plugin Design

**Risk**: LLM plugins or tool-use integrations allow excessive permissions, leading to privilege escalation or data exfiltration.

**Relevance for certifications**: AZ-500, SC-200

**Key controls**:
- Apply principle of least privilege to all plugin permissions.
- Validate and sanitise plugin inputs/outputs.
- Require explicit user consent before destructive actions.

---

## LLM08: Excessive Agency

**Risk**: The LLM is given excessive autonomy to take actions without human oversight, leading to unintended real-world consequences.

**Relevance for certifications**: SC-200, AZ-500

**Key controls**:
- Require human confirmation before high-impact actions.
- Define clear boundaries on what the model can act on autonomously.
- Implement audit logging for all agent actions.

---

## LLM09: Overreliance

**Risk**: Users and systems trust LLM outputs without appropriate scepticism or verification, treating them as authoritative.

**Relevance for certifications**: SC-900, CC

**Key controls**:
- Add explicit uncertainty indicators to LLM responses.
- Design workflows that include human review of high-stakes outputs.
- Train users on appropriate AI use and its limitations.

---

## LLM10: Model Theft

**Risk**: Unauthorised extraction of model weights, architecture, or training data through repeated API queries.

**Relevance for certifications**: CompTIA Security+, AZ-500

**Key controls**:
- Rate limiting and access controls on model endpoints.
- Monitor for bulk extraction patterns in API logs.
- Use watermarking or differential privacy where practical.
