# Evidence Checklist

Use this checklist before publishing any screenshots or files.

---

## 🔒 Sanitization Checklist

### Before EVERY Screenshot

- [ ] No real IP addresses visible
- [ ] No real hostnames visible
- [ ] No real usernames visible
- [ ] No passwords or tokens visible
- [ ] No API keys visible
- [ ] No browser tabs showing personal info
- [ ] No taskbar showing personal apps
- [ ] No file paths containing username
- [ ] No email addresses visible
- [ ] Timestamp shows recent activity (good for credibility)

### Before EVERY File Upload

- [ ] No hardcoded IPs (use 10.x.x.x or 192.168.x.x)
- [ ] No real hostnames (use generic names like "WORKSTATION-01")
- [ ] No credentials in comments
- [ ] No internal company names
- [ ] No customer/client references

---

## 📸 Required Screenshots

| Screenshot | Purpose | Status |
|------------|---------|--------|
| Wazuh Dashboard | Shows active SIEM | [ ] |
| Alert Triggered | Proves detections work | [ ] |
| Agent Status | Shows endpoints connected | [ ] |
| Rule in Editor | Shows actual rule content | [ ] |
| Folder Structure | Shows organization | [ ] |

---

## 📁 Required Samples

| Sample | Purpose | Status |
|--------|---------|--------|
| 1 Sigma Rule | Shows YAML/MITRE format | [ ] |
| 1 Wazuh Rule | Shows XML format | [ ] |
| 1 IR Playbook | Shows documentation style | [ ] |
| 1 Hunt Query | Shows hypothesis approach | [ ] |

---

## 📊 Required Diagrams

| Diagram | Purpose | Status |
|---------|---------|--------|
| MITRE Coverage | Shows framework alignment | [ ] |
| Lab Architecture | Shows infrastructure (sanitized) | [ ] |

---

## ⚠️ Common Mistakes

### Don't Do This

```
❌ Screenshot showing: [REDACTED_IP] (your actual network)
❌ Path showing: C:\Users\Raylee\Documents\...
❌ Alert showing: user "rhawkins" logged in
❌ Config showing: api_key = "sk-abc123..."
```

### Do This Instead

```
✅ Screenshot showing: [REDACTED_IP] (or blur the IP)
✅ Path showing: C:\Users\analyst\Documents\...
✅ Alert showing: user "analyst01" logged in
✅ Config showing: api_key = "[REDACTED]"
```

---

## 🔍 Pre-Push Scan Commands

Run these BEFORE every `git push`:

```bash
# Scan for IP addresses
grep -r -E "([0-9]{1,3}\.){3}[0-9]{1,3}" --include="*.md" --include="*.xml" --include="*.yml"

# Scan for Windows paths with usernames
grep -r -E "C:\\\\Users\\\\" --include="*.md" --include="*.xml" --include="*.yml"

# Scan for secrets
grep -r -E "(password|api_key|token|secret)" --include="*.md" --include="*.xml" --include="*.yml"

# Scan for email addresses
grep -r -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" --include="*.md"
```

**If ANY results appear: STOP. Review. Sanitize. Then push.**

---

## ✅ Final Review

Before publishing the Proof Pack:

- [ ] All screenshots sanitized
- [ ] All sample files sanitized
- [ ] All diagrams use generic/fake data
- [ ] Ran pre-push scan commands
- [ ] Reviewed results manually
- [ ] No personal identifiable information anywhere

---

*Security professionals should demonstrate security awareness in their own repos.*

