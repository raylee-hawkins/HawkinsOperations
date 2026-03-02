# Playbook: Network Anomalies Investigation

## Purpose
This playbook provides procedures for investigating and responding to unusual network activity detected in the HawkinsOps environment, focusing on pfSense firewall logs, traffic analysis, and network-based threats.

**Use When**:
- Unusual traffic patterns detected
- Port scanning or reconnaissance activity
- Suspected command and control (C2) communication
- Data exfiltration indicators
- DNS anomalies or tunneling suspected
- DDoS or resource exhaustion attacks
- Unauthorized network access attempts

---

## Step 1: Initial Detection & Triage

### 1.1 Identify the Anomaly

**Detection Sources**:
- pfSense firewall logs (blocked/allowed traffic)
- Wazuh correlation alerts
- Traffic monitoring dashboards
- IDS/IPS alerts (if Suricata deployed on pfSense)
- Bandwidth monitoring (unusual spikes)
- User reports (slow network, can't access services)

**Document Initial Indicators**:
```
Detection Source: ________________
Detection Time: ________________
Anomaly Type: [ ] Traffic spike [ ] Unusual destination [ ] Port scan [ ] Other: ________
Source IP(s): ________________
Destination IP(s): ________________
Port(s) Involved: ________________
Protocol: [ ] TCP [ ] UDP [ ] ICMP [ ] Other: ________
Traffic Volume (if known): ________________
```

### 1.2 Quick Assessment Questions

- [ ] Is the anomaly currently active or historical?
- [ ] Is it affecting network performance or services?
- [ ] Are internal systems involved or only external?
- [ ] Is this inbound (attack on us) or outbound (compromise)?
- [ ] Do we have other alerts correlating with this activity?
- [ ] Is this a known false positive (legitimate service behavior)?

**Severity Assessment**:
- **Critical**: Active attack affecting services, data exfiltration in progress, malware C2 confirmed
- **High**: Successful reconnaissance, suspicious outbound connections, policy violations
- **Medium**: Failed attack attempts, port scans, unusual but explainable traffic
- **Low**: Single anomaly, likely false positive, minor policy violation

---

## Step 2: pfSense Log Analysis

### 2.1 Access Firewall Logs

```
Navigate to: Status → System Logs → Firewall

Filtering options:
- Source IP
- Destination IP
- Port
- Action (block/pass)
- Interface (WAN, LAN, etc.)
```

### 2.2 Identify Traffic Patterns

**For Port Scanning**:
```
Look for:
- Multiple destination ports from single source IP
- Sequential port numbers
- Short time intervals between attempts
- Mix of TCP SYN packets to various ports

Filter: Source IP = <scanner_IP>
Examine: Destination ports, frequency, blocked vs allowed
```

**For Data Exfiltration**:
```
Look for:
- Large outbound data transfers
- Connections to unusual destinations
- Use of non-standard ports for common protocols
- Encrypted protocols (SSH, VPN) from unexpected hosts
- Regular beacon patterns (consistent interval connections)

Filter: Source IP = <internal_suspected_host>
Examine: Destination IPs, ports, connection frequency, data volume
```

**For C2 Communication**:
```
Look for:
- Regular, periodic connections (beaconing)
- Small data transfers at consistent intervals
- Connections to suspicious or newly registered domains
- Use of common ports (80, 443) from non-browser processes
- Geographic locations inconsistent with business (if GeoIP available)

Filter: Source IP = <potentially_compromised_host>
Examine: Timing patterns, destination reputation, data volumes
```

### 2.3 Export Relevant Logs

```
1. Apply filters to isolate suspicious traffic
2. Copy log entries to text file
3. Save to incident folder:
   ~/HAWKINS_OPS/incidents/YYYY-MM-DD_network_anomaly/pfsense_firewall.log
```

---

## Step 3: Traffic Capture & Analysis

### 3.1 Capture Live Traffic (if ongoing)

**On pfSense**:
```
Navigate to: Diagnostics → Packet Capture

Settings:
- Interface: (select relevant interface - WAN, LAN, etc.)
- Address Family: IPv4
- Protocol: (select based on anomaly - TCP, UDP, or Any)
- Host Address: <suspicious_IP>
- Port: <suspicious_port> (if specific)
- Packet Count: 1000-5000 (depending on traffic volume)

Start capture, let run for 2-5 minutes
Download pcap file when complete
```

**Alternative - SSH to pfSense**:
```bash
# SSH into pfSense:
ssh admin@<pfsense_IP>

# Capture traffic:
tcpdump -i em0 -n host <suspicious_IP> -w /tmp/capture.pcap -c 5000

# Download to PRIMARY_OS:
# Exit pfSense SSH, then from PRIMARY_OS:
scp admin@<pfsense_IP>:/tmp/capture.pcap ~/HAWKINS_OPS/incidents/YYYY-MM-DD_network_anomaly/
```

### 3.2 Analyze Packet Capture

**On PRIMARY_OS with Wireshark or tshark**:

```bash
# Open in Wireshark:
wireshark ~/HAWKINS_OPS/incidents/YYYY-MM-DD_network_anomaly/capture.pcap

# Or analyze with tshark:

# Connection summary:
tshark -r capture.pcap -q -z conv,ip

# HTTP requests:
tshark -r capture.pcap -Y http.request -T fields -e http.host -e http.request.uri

# DNS queries:
tshark -r capture.pcap -Y dns.qry.name -T fields -e dns.qry.name | sort | uniq -c | sort -rn

# Suspicious patterns - large uploads:
tshark -r capture.pcap -q -z io,stat,1,"SUM(frame.len)frame.len"

# Extract destination IPs and counts:
tshark -r capture.pcap -T fields -e ip.dst | sort | uniq -c | sort -rn

# SSL/TLS Server Names (SNI):
tshark -r capture.pcap -Y ssl.handshake.extensions_server_name -T fields -e ssl.handshake.extensions_server_name | sort | uniq
```

**Analysis Focus**:
- [ ] What protocols are being used?
- [ ] What domains/IPs are being contacted?
- [ ] Is data being uploaded (large outbound) or downloaded?
- [ ] Are there any clear text credentials or sensitive data?
- [ ] Do the domains/IPs have legitimate business purpose?
- [ ] Are there patterns suggesting automation (beaconing, scripting)?

---

## Step 4: IP & Domain Intelligence

### 4.1 Investigate External IPs

For each suspicious external IP:

```bash
# WHOIS lookup:
whois <IP_address>

# Reverse DNS:
dig -x <IP_address>
host <IP_address>

# IP reputation databases:
# - AbuseIPDB: https://www.abuseipdb.com/check/<IP>
# - GreyNoise: https://viz.greynoise.io/ip/<IP>
# - AlienVault OTX: https://otx.alienvault.com/indicator/ip/<IP>
# - VirusTotal: https://www.virustotal.com/gui/ip-address/<IP>

# Shodan (what services does this IP run):
# https://www.shodan.io/host/<IP>
```

**Document for each IP**:
```
IP Address: ________________
Geographic Location: ________________
Hosting Provider/ASN: ________________
Reputation (clean/suspicious/malicious): ________________
Known associations: ________________
Business justification (if any): ________________
```

### 4.2 Investigate Domains

For each suspicious domain:

```bash
# DNS resolution:
dig <domain> ANY
host <domain>

# WHOIS:
whois <domain>

# Check registration date (recently registered = suspicious):
whois <domain> | grep -i "creation date"

# Domain reputation:
# - VirusTotal: https://www.virustotal.com/gui/domain/<domain>
# - URLVoid: https://www.urlvoid.com/scan/<domain>
# - Cisco Talos: https://talosintelligence.com/reputation_center/lookup?search=<domain>
```

**Red Flags**:
- Domain registered within last 30 days
- Privacy protection on WHOIS (common for malicious domains)
- No clear business or legitimate use
- Random or algorithmically generated name (DGA)
- Multiple threat intelligence sources flag as malicious
- Hosting in bulletproof hosting locations

### 4.3 DNS Tunneling Indicators

**Check for DNS tunneling signs**:
- Abnormally long subdomain names (>50 characters)
- High volume of DNS requests to single domain
- Primarily TXT record queries (used for exfiltration)
- High entropy in subdomain strings (random/encoded appearance)
- Incrementing subdomains (a1.example.com, a2.example.com...)

**Analyze DNS logs**:
```
On pfSense (if DNS resolver):
Status → System Logs → Resolver

Look for:
- Same endpoint making hundreds/thousands of queries
- Queries to unusual domains
- TXT record requests
```

---

## Step 5: Endpoint Investigation

### 5.1 Identify Affected Endpoints

From pfSense logs and packet captures, list all internal IPs involved in suspicious traffic.

For each internal IP:
```bash
# On Wazuh Dashboard:
# - Identify agent by IP address
# - Check recent alerts from this agent
# - Review agent status and health

# Identify hostname:
# Option 1: Check Wazuh agent list
# Option 2: From PRIMARY_OS:
nslookup <internal_IP>
# Or check pfSense DHCP leases: Status → DHCP Leases
```

### 5.2 Investigate Process Making Connection

**Windows**:
```powershell
# On affected Windows endpoint:
# Find process with connection to suspicious IP/port:
Get-NetTCPConnection -RemoteAddress <suspicious_IP> -State Established |
  Select-Object LocalPort, RemotePort, OwningProcess,
  @{Name='ProcessName';Expression={(Get-Process -Id $_.OwningProcess).Name}},
  @{Name='ProcessPath';Expression={(Get-Process -Id $_.OwningProcess).Path}}

# If Sysmon deployed, check historical connections:
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=3} |
  Where-Object {$_.Properties[14].Value -eq '<suspicious_IP>'} |
  Select-Object TimeCreated,
  @{Name='Process';Expression={$_.Properties[4].Value}},
  @{Name='DestIP';Expression={$_.Properties[14].Value}},
  @{Name='DestPort';Expression={$_.Properties[16].Value}}
```

**Linux**:
```bash
# On affected Linux endpoint:
# Find process with connection to suspicious IP:
sudo lsof -i -n -P | grep <suspicious_IP>

# Or:
sudo netstat -antp | grep <suspicious_IP>

# Check command line of suspicious process:
cat /proc/<PID>/cmdline | tr '\0' ' ' && echo
```

### 5.3 Assess Endpoint for Compromise

If endpoint is making suspicious network connections, follow:
- **Playbook: Suspicious Endpoint Activity** for detailed investigation
- **Scenario 05: Potential Malware** if malware suspected

**Quick checks**:
- [ ] Is a known-good process making connections, or unknown?
- [ ] Does the user have legitimate reason to contact this destination?
- [ ] Are there other signs of compromise (unusual processes, files, etc.)?
- [ ] Does this endpoint have other Wazuh alerts?

---

## Step 6: Network-Level Containment

### 6.1 Block Malicious IPs/Domains

**At pfSense (preferred - protects all endpoints)**:

**Option 1: Firewall Rule**:
```
Firewall → Rules → WAN (or relevant interface)
Add Rule:
  - Action: Block
  - Interface: WAN
  - Source: Any
  - Destination: Single host or alias → <malicious_IP>
  - Description: "Block malicious IP - Incident YYYY-MM-DD"
Apply Changes
```

**Option 2: Aliases (for multiple IPs)**:
```
Firewall → Aliases → IP
Add Alias:
  - Name: "Malicious_IPs_Incident_YYYYMMDD"
  - Type: Host(s)
  - IP Addresses: <add each malicious IP>
Save

Firewall → Rules → WAN
Add Rule:
  - Action: Block
  - Destination: Alias → Malicious_IPs_Incident_YYYYMMDD
Apply Changes
```

**Block Domains** (if using pfSense DNS resolver):
```
Services → DNS Resolver → General Settings → Host Overrides
Add Override:
  - Host: <malicious_domain>
  - IP Address: [REDACTED_IP] (or sinkhole IP)
Save and Apply
```

### 6.2 Isolate Compromised Endpoint

**If endpoint is confirmed compromised and making C2 connections**:

**Option 1: Firewall-level isolation**:
```
Firewall → Rules → LAN
Add rule blocking specific internal IP from all outbound traffic
(Allow only to management systems for remediation)
```

**Option 2: Endpoint-level isolation**:
```powershell
# Windows:
Disable-NetAdapter -Name "Ethernet" -Confirm:$false
```

```bash
# Linux:
sudo ip link set eth0 down
```

### 6.3 Deploy IDS/IPS (if not already)

**Consider deploying Suricata on pfSense**:
```
System → Package Manager → Available Packages
Search: "suricata"
Install

Services → Suricata → Interfaces
Configure IDS/IPS on WAN and/or LAN interfaces
Enable rule sets (ET Open, Abuse.ch, etc.)
```

---

## Step 7: Monitoring & Verification

### 7.1 Verify Block is Effective

```
pfSense:
Status → System Logs → Firewall
Filter for: blocked traffic to malicious IP

Confirm:
- Attempts are being blocked
- No traffic is getting through
- Block count is incrementing if attempts continue
```

### 7.2 Monitor for Shift in Tactics

**Attackers may**:
- Switch to different IPs or domains
- Use different ports or protocols
- Attempt to disable security controls

**Continue monitoring**:
- pfSense logs for new unusual traffic
- Affected endpoint for continued suspicious activity
- Other endpoints for similar patterns (lateral movement)
- Wazuh for new alerts

### 7.3 Set Up Enhanced Monitoring

**Create Wazuh custom rules** for this attack pattern:
```xml
<!-- Example: Alert on connections to specific malicious IP -->
<!-- Location: /var/ossec/etc/rules/local_rules.xml on Wazuh server -->
<rule id="100001" level="10">
  <if_group>firewall</if_group>
  <match>malicious_IP</match>
  <description>Connection attempt to known malicious IP</description>
  <group>network_traffic,</group>
</rule>
```

---

## Step 8: Evidence Collection

### 8.1 Network Evidence

```bash
# Collect and save to incident folder:
INCIDENT_DIR=~/HAWKINS_OPS/incidents/YYYY-MM-DD_network_anomaly

# pfSense firewall logs (already exported in Step 2.3)

# Packet captures (already captured in Step 3.1)

# Traffic statistics from pfSense:
# Status → Monitoring → Traffic Graph
# Take screenshots of relevant timeframes

# pfSense configuration backup (for documentation):
# Diagnostics → Backup & Restore → Download configuration
# Save to: $INCIDENT_DIR/pfsense_config_YYYYMMDD.xml
```

### 8.2 Threat Intelligence

```bash
# Document all threat intelligence findings:
# Save WHOIS, reputation checks, VirusTotal results

whois <malicious_IP> > $INCIDENT_DIR/malicious_IP_whois.txt
dig <malicious_domain> ANY > $INCIDENT_DIR/malicious_domain_dns.txt

# Screenshots of:
# - VirusTotal results
# - AbuseIPDB reports
# - Other threat intel sources
```

### 8.3 Endpoint Evidence (if applicable)

If endpoint was involved, collect:
- Process listings
- Network connection logs
- Wazuh agent logs
- System event logs

See **Playbook: Suspicious Endpoint Activity** Step 7.

---

## Step 9: Root Cause Analysis

### 9.1 Determine How Anomaly Occurred

**Questions to answer**:
- [ ] Was this an external attack or internal compromise?
- [ ] If external, how did they gain access (exploit, weak credential, etc.)?
- [ ] If internal, how was endpoint compromised (malware, phishing, etc.)?
- [ ] Were security controls in place? Did they work?
- [ ] Was this preventable with current controls?
- [ ] What was the attacker's objective (reconnaissance, data exfil, etc.)?

### 9.2 Timeline Reconstruction

```
Create timeline from earliest indicator to containment:

1. [Timestamp] Initial compromise/reconnaissance began
2. [Timestamp] First suspicious network connection detected
3. [Timestamp] Alert generated (Wazuh, pfSense, etc.)
4. [Timestamp] Investigation began
5. [Timestamp] Confirmed malicious activity
6. [Timestamp] Containment applied
7. [Timestamp] Verified block effective
8. [Timestamp] Remediation completed

Document gaps:
- Time from compromise to detection (dwell time)
- Time from detection to containment
- Time from containment to full remediation
```

---

## Step 10: Remediation & Hardening

### 10.1 Address Root Cause

Based on root cause analysis, remediate:

**If external attack**:
- Patch vulnerabilities exploited
- Strengthen perimeter security (firewall rules, IDS/IPS)
- Implement additional authentication (MFA, VPN)

**If internal compromise**:
- Clean/rebuild affected endpoint (see Scenario 05)
- Reset compromised credentials
- Remove persistence mechanisms
- Patch endpoint vulnerabilities

### 10.2 Network Hardening

**Firewall**:
- Review and tighten firewall rules (least privilege)
- Implement egress filtering (restrict outbound traffic)
- Enable logging on all critical rules
- Deploy pfBlockerNG for automated threat blocking

**Segmentation**:
- Isolate sensitive systems on separate VLANs
- Implement inter-VLAN firewall rules
- Restrict lateral movement paths

**Monitoring**:
- Deploy IDS/IPS (Suricata) if not present
- Increase log retention on pfSense
- Send pfSense logs to Wazuh for correlation
- Create dashboards for network traffic visibility

**DNS**:
- Deploy DNS filtering (pfBlockerNG DNSBL)
- Monitor for DNS tunneling patterns
- Block DNS over HTTPS (DoH) to enforce filtering

---

## Step 11: Documentation & Closure

### 11.1 Incident Report

**Create comprehensive report** including:
- **Summary**: What happened, impact, resolution
- **Timeline**: Detailed event sequence
- **IOCs**: IPs, domains, hashes, user-agents, etc.
- **Root Cause**: How and why this occurred
- **Containment Actions**: What was blocked/isolated
- **Remediation**: What was fixed/hardened
- **Lessons Learned**: What went well, what to improve
- **Recommendations**: Specific action items

**Save to**: `~/HAWKINS_OPS/incidents/YYYY-MM-DD_network_anomaly/incident_report.md`

### 11.2 Update Threat Intelligence

```
# Share IOCs:
- Add to internal blocklist (pfSense aliases)
- Submit to public threat feeds (if appropriate)
- Update Wazuh custom rules
- Document in HawkinsOps IOC database

# Update documentation:
- Add new attack pattern to playbooks
- Update firewall rule documentation
- Add lessons learned to knowledge base
```

### 11.3 Follow-Up Actions

- [ ] All IOCs blocked at firewall
- [ ] Affected endpoints fully remediated
- [ ] Security gaps addressed
- [ ] Monitoring enhanced for this attack type
- [ ] Playbooks updated with new learnings
- [ ] Team training on new attack techniques (if applicable)

---

## VERIFY Checklist

Before closing incident:
- [ ] All malicious IPs/domains blocked
- [ ] Compromised endpoints identified and remediated
- [ ] Root cause identified and addressed
- [ ] Evidence collected and preserved
- [ ] Incident documented thoroughly
- [ ] IOCs added to threat intelligence
- [ ] Wazuh alerts updated/closed
- [ ] Network hardening implemented
- [ ] Monitoring validated for this attack type
- [ ] Lessons learned documented

---

## Common Network Anomaly Types

| Anomaly Type | Indicators | Likely Cause | Priority |
|--------------|-----------|--------------|----------|
| **Port Scan** | Multiple ports hit from single IP | Reconnaissance | Medium-High |
| **Brute Force** | Multiple failed auth to single service | Credential attack | High |
| **DDoS/DoS** | Massive traffic volume, service degradation | Denial of service | Critical |
| **Data Exfiltration** | Large outbound transfers, unusual destinations | Compromise/insider | Critical |
| **C2 Communication** | Regular beaconing, suspicious domains | Malware infection | Critical |
| **DNS Tunneling** | Abnormal DNS queries, long subdomains | Covert channel | High |
| **ARP Spoofing** | Duplicate MAC addresses, MitM indicators | Network attack | High |
| **Lateral Movement** | Internal port scanning, SMB/RDP between hosts | Post-compromise | Critical |

---

## References

- Scenario 03: Outbound DNS Tunnel Suspected
- Scenario 06: Unusual Web Traffic from Linux
- Scenario 07: Potential Data Exfiltration
- Scenario 10: Firewall Rule Change
- Playbook: General Incident Response
- pfSense documentation
- Wireshark/tshark analysis guides

