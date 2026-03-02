# Scenario 03: Suspected DNS Tunneling / Data Exfiltration

## Environment Context
- **Primary Detection**: Wazuh SIEM, pfSense logs, network monitoring
- **Affected System**: Any HawkinsOps endpoint (Windows or Linux)
- **HawkinsOps Components Involved**:
  - pfSense (DNS request logging, traffic analysis)
  - Wazuh server (correlation, alerting)
  - Affected endpoint
  - PRIMARY_OS (analysis workstation)

## Detection

### Indicators of DNS Tunneling
- **Abnormally long DNS queries** (>50 characters in subdomain)
- **High volume of DNS requests** to single domain
- **Unusual TXT record queries** (often used for data exfil)
- **Non-standard DNS query patterns** (rapid-fire queries)
- **Suspicious domain names** (randomly generated, high entropy)
- **Large DNS response sizes**

### Wazuh Alert Details
- **Rule ID**: Custom rule for DNS anomalies (or 87103 - Abnormal DNS query)
- **Rule Level**: 8-10
- **Event Source**: DNS logs, firewall logs, Sysmon (Windows)

### pfSense Detection
- **Location**: Status → System Logs → Resolver (if using pfSense DNS)
- **Indicators**:
  - Same endpoint generating thousands of DNS queries
  - Queries to unusual TLDs or domain patterns
  - Queries to newly registered domains (NRDs)

### Windows Detection
- **Sysmon Event ID 22**: DNS query event
- **Network connection patterns** (Event ID 3)

### Linux Detection
- **DNS cache analysis**: `sudo systemd-resolve --statistics`
- **tcpdump DNS monitoring**: Traffic spike to port 53

## Triage Steps

1. **Identify Suspicious Endpoint and Domain**
   - From Wazuh alert or pfSense logs, note:
     - Source IP/hostname
     - Suspicious domain(s)
     - Query volume and timeframe

2. **Analyze DNS Query Patterns on pfSense**
   ```
   Navigate to: Status → System Logs → Resolver
   - Filter by source IP
   - Look for patterns: query frequency, domain structure
   - Export log excerpt for analysis
   ```

3. **Capture Live DNS Traffic** (from pfSense or gateway)
   ```bash
   # SSH into pfSense or use Diagnostics → Packet Capture
   tcpdump -i em0 -n port 53 and host <endpoint_IP> -w /tmp/dns_capture.pcap

   # Let it run for 2-5 minutes, then analyze
   ```

4. **Examine Suspicious Domain**
   ```bash
   # On PRIMARY_OS:
   # Domain WHOIS:
   whois <suspicious_domain>

   # Check domain age:
   # Use online tools: whois.domaintools.com

   # DNS record enumeration:
   dig <suspicious_domain> ANY
   dig <suspicious_domain> TXT
   dig <suspicious_domain> NS

   # Check domain reputation:
   # VirusTotal, AbuseIPDB, Cisco Talos Intelligence
   ```

5. **Analyze Query Entropy** (randomness in subdomains)
   ```bash
   # Extract subdomains from pcap or logs:
   # Look for patterns like: a3f7k2m9.b8j4n1p5.evil.com
   # High entropy = likely tunnel/C2

   # Visual inspection for:
   # - Base64-like strings
   # - Hex patterns
   # - Incrementing sequences
   ```

6. **Investigate Endpoint Activity**

   **Windows:**
   ```powershell
   # Find processes making DNS queries (requires Sysmon):
   Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=22} |
     Where-Object {$_.Properties[4].Value -like '*<domain>*'} |
     Select-Object TimeCreated, @{Name='Process';Expression={$_.Properties[3].Value}},
     @{Name='Query';Expression={$_.Properties[4].Value}}

   # Check network connections:
   Get-NetTCPConnection | Select-Object LocalAddress, RemoteAddress, State, OwningProcess
   ```

   **Linux (MINT-3):**
   ```bash
   # Check DNS resolver stats:
   sudo systemd-resolve --statistics

   # Check processes with network activity:
   sudo lsof -i -P -n | grep ESTABLISHED

   # Capture DNS queries from endpoint:
   sudo tcpdump -i any -n port 53 -w /tmp/dns_local.pcap
   ```

7. **Check for Known DNS Tunneling Tools**

   **Windows:**
   ```powershell
   # Search for common tools:
   Get-Process | Where-Object {$_.ProcessName -match 'iodine|dns2tcp|dnscat'}

   # Check recent downloads:
   Get-ChildItem -Path C:\Users\*\Downloads -Recurse -ErrorAction SilentlyContinue |
     Where-Object {$_.Name -match 'dns|tunnel|iodine'}
   ```

   **Linux:**
   ```bash
   # Check for tunneling tools:
   ps aux | grep -E 'iodine|dns2tcp|dnscat'

   # Check installed packages:
   dpkg -l | grep -E 'iodine|dns2tcp|dnscat'

   # Recent command history:
   cat ~/.bash_history | grep -E 'dns|tunnel'
   ```

## Investigation Checklist

- [ ] Query volume abnormally high? (>100 queries/min to single domain)
- [ ] Subdomain strings appear random/encoded?
- [ ] Domain recently registered (< 30 days)?
- [ ] Domain resolves to suspicious IP or bulletproof hosting?
- [ ] Queries primarily TXT records (common for exfil)?
- [ ] Endpoint has other signs of compromise?
- [ ] Known tunneling tools present on system?
- [ ] User reports legitimate use case for this domain?
- [ ] Similar activity from other endpoints (lateral movement)?
- [ ] Timing correlates with other suspicious events?

## Containment Actions

### Immediate Actions:

1. **Block Domain at pfSense DNS Resolver**
   ```
   Services → DNS Resolver → General Settings
   Add to Host Overrides with null IP ([REDACTED_IP] or sinkhole IP)

   OR

   Create custom DNS blocklist including domain
   ```

2. **Block at Firewall Level**
   ```
   Firewall → Aliases → Add new alias with suspicious domain/IPs
   Firewall → Rules → Add block rule using alias
   ```

3. **Isolate Endpoint** (if active exfiltration confirmed)

   **Windows:**
   ```powershell
   # Disable network adapter:
   Disable-NetAdapter -Name "Ethernet" -Confirm:$false
   ```

   **Linux:**
   ```bash
   # Bring down interface:
   sudo ip link set eth0 down

   # Or use UFW to block all outbound:
   sudo ufw default deny outgoing
   ```

4. **Kill Suspicious Process**

   **Windows:**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

   **Linux:**
   ```bash
   sudo kill -9 <PID>
   ```

5. **Enable Enhanced DNS Logging**
   - pfSense: Enable full query logging temporarily
   - Windows: Ensure Sysmon DNS logging active (Event ID 22)
   - Linux: Configure dnsmasq or systemd-resolved for detailed logging

### If Confirmed Malicious:

1. Full endpoint investigation (see Scenario 05 - Malware)
2. Search for persistence mechanisms
3. Memory dump for forensic analysis
4. Check for additional C2 channels
5. Assess what data may have been exfiltrated

## Evidence to Capture

1. **DNS Query Logs**
   ```bash
   # From pfSense:
   # Status → System Logs → Resolver → Export to file
   # Save to ~/HAWKINS_OPS/incidents/YYYY-MM-DD_dns_tunnel/pfsense_dns.log
   ```

2. **Packet Capture**
   ```bash
   # Transfer pcap from pfSense:
   scp admin@pfsense:/tmp/dns_capture.pcap ~/HAWKINS_OPS/incidents/YYYY-MM-DD_dns_tunnel/
   ```

3. **Domain Intelligence**
   ```bash
   # Save WHOIS data:
   whois <domain> > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_dns_tunnel/domain_whois.txt

   # DNS records:
   dig <domain> ANY > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_dns_tunnel/domain_dns.txt
   ```

4. **Endpoint State**

   **Windows:**
   ```powershell
   # Export Sysmon DNS events:
   Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=22} |
     Export-Csv C:\temp\sysmon_dns.csv

   # Network connections:
   Get-NetTCPConnection | Export-Csv C:\temp\network_conn.csv
   ```

   **Linux:**
   ```bash
   # DNS statistics:
   sudo systemd-resolve --statistics > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_dns_tunnel/dns_stats.txt

   # Process list:
   ps auxf > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_dns_tunnel/processes.txt
   ```

5. **Wazuh Alert Export**
   - Full alert JSON with correlation data

6. **Screenshots**
   - pfSense DNS logs showing spike
   - Wireshark analysis of pcap
   - VirusTotal/threat intel results for domain

## Closure & Lessons Learned

### Ticket Closure Steps:
1. Verify domain is blocked at all DNS resolvers
2. Confirm endpoint is clean or has been remediated
3. Document data exfiltration scope (if any)
4. Update threat intelligence feeds with IOCs
5. Close Wazuh alert with detailed notes
6. Archive all evidence

### Hardening Recommendations:
- **Deploy DNS filtering** at pfSense (pfBlockerNG with threat feeds)
- **Enable DNS over HTTPS (DoH) blocking** to prevent bypass
- **Implement DNS sinkhole** for known-bad domains
- **Configure Wazuh custom rules** for DNS anomaly detection:
  - Query length > 50 chars
  - Query rate > 100/min to single domain
  - High entropy subdomain detection
- **Deploy/enhance Sysmon** on Windows endpoints for DNS query logging
- **Use allowlist for critical servers** (only allow DNS to specific domains)
- **Implement egress filtering** - only allow necessary outbound protocols
- **Regular DNS log analysis** for baseline establishment
- **Deploy IDS/IPS** (Suricata on pfSense) with DNS tunnel detection rules
- **User awareness training** on malware and C2 channels

### Portfolio Notes:
- Demonstrates understanding of covert channels and data exfiltration techniques
- Shows network-level investigation skills (packet analysis, DNS deep-dive)
- Highlights multi-layer detection and prevention (endpoint + network)
- Emphasizes threat intelligence integration

