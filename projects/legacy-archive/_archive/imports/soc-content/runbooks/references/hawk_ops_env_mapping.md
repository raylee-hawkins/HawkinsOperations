# HawkinsOps Environment Mapping

## Purpose
This document defines the HawkinsOps environment architecture, including hostnames, roles, IP addressing, logging flows, and how systems integrate with the SIEM (Wazuh) and security infrastructure.

---

## Network Architecture Overview

```
                        Internet
                           |
                      [pfSense]
                    Firewall/Router
                           |
                    ----------------
                    |              |
                  [WAN]          [LAN]
                                   |
            ------------------------------------
            |           |           |          |
      [Wazuh Server] [Windows]  [PRIMARY_OS] [MINT-3]
                    Powerhouse    (Linux)     (Linux)
```

---

## System Inventory

### 1. pfSense Firewall/Router

**Role**: Network gateway, firewall, DHCP server, DNS resolver, VPN concentrator

**Hostname**: `pfsense.hawkinsops.local` (or default: `pfSense`)

**IP Address** (assumed):
- **WAN Interface**: DHCP from ISP (or static public IP)
- **LAN Interface**: `[REDACTED_IP]` (assumed default)
- **Management Access**: HTTPS on port 443 (or custom port)

**Services**:
- Firewall rules (inbound/outbound filtering)
- NAT (Network Address Translation)
- DHCP server for LAN
- DNS resolver (Unbound)
- Optional: VPN (OpenVPN, WireGuard, IPsec)
- Optional: IDS/IPS (Suricata)
- Optional: pfBlockerNG (ad-blocking, threat blocking)

**Logging**:
- **Local Logs**:
  - Firewall logs: `/var/log/filter.log`
  - System logs: `/var/log/system.log`
  - DHCP logs: `/var/log/dhcpd.log`
  - DNS resolver logs (if enabled)
- **Web UI Access**: Status → System Logs → [Firewall|System|DHCP|etc.]
- **Integration with Wazuh**: Send syslog to Wazuh server (Status → System Logs → Settings → Remote Logging)

**Key Log Indicators**:
- Blocked traffic (firewall drops)
- Port forwarding hits
- VPN connections
- DNS queries (if resolver logging enabled)

**Access**:
- **Web Interface**: `https://[REDACTED_IP]` (or custom)
- **SSH**: Enabled/disabled in System → Advanced → Secure Shell
- **Credentials**: Admin account (set during setup)

---

### 2. Wazuh Server

**Role**: SIEM (Security Information and Event Management), log aggregation, correlation, alerting, FIM

**Hostname**: `wazuh-server.hawkinsops.local` (assumed)

**IP Address**: `192.168.1.X` (assign static in pfSense DHCP or manually)

**OS**: Linux (typically Ubuntu/CentOS/RHEL)

**Services**:
- Wazuh Manager (port 1514 for agent communication, 1515 for cluster)
- Wazuh API (port 55000)
- Elasticsearch (port 9200) - for log storage and indexing
- Kibana/Wazuh Dashboard (port 443 or 5601) - web UI
- Filebeat - log forwarding to Elasticsearch

**Wazuh Components**:
- **Manager**: Receives logs from agents, applies rules, generates alerts
- **Agents**: Installed on endpoints (Windows Powerhouse, PRIMARY_OS, MINT-3)
- **Rules**: Located at `/var/ossec/etc/rules/` (default + custom)
- **Decoders**: `/var/ossec/etc/decoders/`
- **Alerts**: Stored in Elasticsearch, viewable in Dashboard

**Key Directories** (on Wazuh Manager):
- Alerts: `/var/ossec/logs/alerts/alerts.log`
- Agent logs: `/var/ossec/logs/ossec.log`
- Rules: `/var/ossec/etc/rules/`
- FIM data: `/var/ossec/queue/diff/`

**Agent Configuration**:
- **ossec.conf** on each agent defines:
  - Manager IP/hostname
  - Log files to monitor
  - FIM directories to watch
  - Command monitoring (if applicable)

**Access**:
- **Web Dashboard**: `https://wazuh-server-IP:443` (or configured port)
- **SSH**: For administrative access
- **API**: `https://wazuh-server-IP:55000`

---

### 3. Windows Powerhouse

**Role**: Primary Windows endpoint for productivity, testing, and monitoring

**Hostname**: `POWERHOUSE` or `WIN-POWERHOUSE`

**IP Address**: `192.168.1.X` (DHCP or static)

**OS**: Windows 10/11 (specify version)

**Wazuh Agent**: Installed
- **Agent Config**: `C:\Program Files (x86)\ossec-agent\ossec.conf`
- **Agent Service**: "Wazuh" service
- **Logs Monitored**:
  - Security Event Log
  - System Event Log
  - Application Event Log
  - PowerShell Operational Log (if configured)
  - Sysmon Log (if Sysmon deployed)
- **FIM Monitored Paths** (example):
  - `C:\Windows\System32`
  - `C:\Program Files`
  - `C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

**Security Tools**:
- Windows Defender (built-in antivirus)
- Optional: Sysmon (enhanced logging)
- Firewall: Windows Firewall (managed)

**Key Log Sources**:
- **Security Log**: Authentication, process creation (if auditing enabled), object access
- **Sysmon**: Process creation, network connections, file creation, registry changes
- **PowerShell**: Script block logging, module logging
- **Windows Defender**: Malware detections

**Integration with Wazuh**:
- Wazuh agent sends Windows Event Log entries matching `ossec.conf` filters
- Alerts generated in Wazuh for suspicious activity

**Access**:
- **RDP**: Port 3389 (restrict via pfSense to VPN or specific IPs)
- **WinRM**: If enabled for remote management
- **Local Console**: Physical or VM console

---

### 4. PRIMARY_OS (Linux Mint - Primary Workstation)

**Role**: Primary Linux workstation, SOC analyst station, incident investigation platform

**Hostname**: `PRIMARY-OS` or `primary-mint`

**IP Address**: `192.168.1.X` (DHCP or static)

**OS**: Linux Mint 21.x (Ubuntu-based)

**Wazuh Agent**: Installed
- **Agent Config**: `/var/ossec/etc/ossec.conf`
- **Agent Service**: `wazuh-agent`
- **Logs Monitored**:
  - `/var/log/auth.log`
  - `/var/log/syslog`
  - `/var/log/kern.log`
  - `/var/log/dpkg.log` (package management)
- **FIM Monitored Paths** (example):
  - `/etc`
  - `/bin`, `/sbin`, `/usr/bin`, `/usr/sbin`
  - `/home/<user>/.ssh`

**Security Tools**:
- UFW (Uncomplicated Firewall) - host-based firewall
- Optional: ClamAV (antivirus)
- Optional: Fail2Ban (brute-force protection)
- Optional: AppArmor (mandatory access control)

**Key Log Sources**:
- **auth.log**: SSH logins, sudo usage, authentication
- **syslog**: General system events
- **dpkg.log**: Software installations/removals

**Integration with Wazuh**:
- Wazuh agent monitors specified log files and directories
- FIM alerts for unauthorized file changes
- Command monitoring (if configured)

**Access**:
- **SSH**: Port 22 (restrict via pfSense or UFW)
- **Local Console**: Physical or VM console

**Special Role**:
- Houses incident investigation tools
- Stores HawkinsOps folder structure: `~/HAWKINS_OPS/`
- Primary interface for Wazuh dashboard access (web browser)
- Network analysis (Wireshark, tshark, tcpdump)

---

### 5. MINT-3 (Linux Mint - Secondary Endpoint)

**Role**: Secondary Linux endpoint for testing, additional monitoring, light services

**Hostname**: `MINT-3` or `mint3`

**IP Address**: `192.168.1.X` (DHCP or static)

**OS**: Linux Mint 21.x (Ubuntu-based)

**Wazuh Agent**: Installed
- **Configuration**: Similar to PRIMARY_OS
- **Purpose**: Additional endpoint for testing scenarios, simulating multi-endpoint environment

**Access**:
- **SSH**: Port 22 (restrict via pfSense or UFW)
- **Local Console**: Physical or VM console

**Note**: Configuration mirrors PRIMARY_OS for consistency. May be used for:
- Testing security controls before deploying to production
- Simulating attacks in isolated environment
- Additional log source for correlation

---

## Future Environment (Planned)

### Active Directory Domain

**Planned Components**:
- **Domain Controller**: Windows Server (hostname: `DC01.hawkinsops.local`)
- **Domain Name**: `hawkinsops.local`
- **Member Servers**: Windows Server for file sharing, application hosting
- **Domain-Joined Workstations**: Windows Powerhouse and potentially others

**When Implemented**:
- **Additional Logs**:
  - Domain Controller Security Log (Event ID 4776, 4768, 4769 - Kerberos)
  - NTLM authentication events
  - Group Policy changes (Event ID 4739)
  - Replication events
- **Wazuh Integration**:
  - Wazuh agent on Domain Controller
  - Monitor AD-specific logs
  - Create correlation rules for AD attacks (Golden Ticket, DCSync, etc.)

---

## Network Segments (Current & Future)

### Current (Assumed Flat LAN)
- **LAN Subnet**: `[REDACTED_IP]/24`
- **All systems on same subnet**: Simplifies initial setup
- **Firewall rules at pfSense**: Control inbound WAN traffic

### Future (Segmented)
- **Management VLAN**: Wazuh server, administrative access
- **Workstation VLAN**: PRIMARY_OS, MINT-3, Windows Powerhouse
- **Server VLAN**: Domain Controller, file servers, applications
- **DMZ (if hosting public services)**: Web servers exposed to Internet

**Benefits of Segmentation**:
- Limits lateral movement
- Granular firewall rules between VLANs
- Enhanced monitoring (inter-VLAN traffic logged)

---

## Log Flow Architecture

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   pfSense   │       │   Windows   │       │ PRIMARY_OS  │
│             │       │  Powerhouse │       │   (Mint)    │
│ Syslog →────┼───┐   │             │       │             │
└─────────────┘   │   │ Wazuh Agent │       │ Wazuh Agent │
                  │   │      ↓      │       │      ↓      │
┌─────────────┐   │   └──────┼──────┘       └──────┼──────┘
│   MINT-3    │   │          │                     │
│             │   │          │                     │
│ Wazuh Agent │   │          └─────────┬───────────┘
│      ↓      │   │                    │
└──────┼──────┘   │                    │
       │          │                    │
       └──────────┴────────────────────┤
                                       ↓
                              ┌─────────────────┐
                              │  Wazuh Manager  │
                              │   (Port 1514)   │
                              │        ↓        │
                              │  Elasticsearch  │
                              │        ↓        │
                              │ Wazuh Dashboard │
                              └─────────────────┘
                                       ↑
                                       │
                              ┌────────┴────────┐
                              │   SOC Analyst   │
                              │ (via web browser│
                              │  on PRIMARY_OS) │
                              └─────────────────┘
```

### Log Sources → Wazuh

| Source | Method | Port | Format |
|--------|--------|------|--------|
| Windows Powerhouse | Wazuh Agent | 1514/tcp | Wazuh protocol |
| PRIMARY_OS | Wazuh Agent | 1514/tcp | Wazuh protocol |
| MINT-3 | Wazuh Agent | 1514/tcp | Wazuh protocol |
| pfSense | Syslog | 514/udp | Syslog format |
| Future Domain Controller | Wazuh Agent | 1514/tcp | Wazuh protocol |

---

## IP Address Assignments (Example/Placeholder)

**Note**: Adjust based on actual HawkinsOps deployment

| Device/System | Hostname | IP Address | DHCP/Static | Notes |
|---------------|----------|------------|-------------|-------|
| pfSense LAN | pfsense | [REDACTED_IP] | Static | Default gateway |
| Wazuh Server | wazuh-server | [REDACTED_IP] | Static | SIEM |
| Windows Powerhouse | POWERHOUSE | [REDACTED_IP] | Static/DHCP Reserved | Primary Windows endpoint |
| PRIMARY_OS | primary-mint | [REDACTED_IP] | Static/DHCP Reserved | Primary Linux workstation |
| MINT-3 | mint3 | [REDACTED_IP] | Static/DHCP Reserved | Secondary Linux endpoint |
| Domain Controller (future) | DC01 | [REDACTED_IP] | Static | Active Directory |

**DHCP Reservation** (pfSense):
- Services → DHCP Server → LAN
- Add static mappings for each system (MAC address → IP address)
- Ensures consistent IPs without manual static configuration on endpoints

---

## Firewall Rules Summary (pfSense)

### WAN Rules (Inbound from Internet)

| # | Action | Source | Destination | Port | Description |
|---|--------|--------|-------------|------|-------------|
| 1 | **Block** | Any | Any | Any | Default deny (unless explicitly allowed below) |
| 2 | **Block** | Bogon networks | Any | Any | Block invalid/reserved IPs |
| 3 | **Allow** | Any | pfSense WAN | VPN port | OpenVPN access (if deployed) |
| 4 | **Allow** (with caution) | Specific trusted IPs | Windows Powerhouse | 3389 | RDP (ONLY if absolutely necessary, prefer VPN) |

**Best Practice**: Minimize WAN-initiated connections. Use VPN for remote access.

### LAN Rules (Outbound from internal network)

| # | Action | Source | Destination | Port | Description |
|---|--------|--------|-------------|------|-------------|
| 1 | **Allow** | LAN subnet | Any | Any | Default allow outbound (can be restricted per security policy) |
| 2 | **Block** | Compromised Host IP | Any | Any | Containment during incident |

**Future Segmentation**: Inter-VLAN rules with granular control.

---

## Wazuh Rule & Alert Customization

### Custom Rules Location
- **Wazuh Server**: `/var/ossec/etc/rules/local_rules.xml`

### Examples for HawkinsOps:

```xml
<!-- Alert on pfSense firewall block events -->
<rule id="100001" level="5">
  <decoded_as>pfsense-filterlog</decoded_as>
  <action>block</action>
  <description>pfSense blocked traffic</description>
  <group>firewall,pfsense,</group>
</rule>

<!-- Alert on Windows Powerhouse admin logon -->
<rule id="100002" level="8">
  <if_sid>60122</if_sid>
  <hostname>POWERHOUSE</hostname>
  <description>Admin logon on Windows Powerhouse</description>
  <group>authentication,windows,admin,</group>
</rule>

<!-- Alert on PRIMARY_OS sudo usage -->
<rule id="100003" level="5">
  <if_sid>5402</if_sid>
  <hostname>primary-mint</hostname>
  <description>Sudo command on PRIMARY_OS</description>
  <group>sudo,linux,</group>
</rule>
```

---

## Critical Directories & Files

### On Wazuh Server
- Rules: `/var/ossec/etc/rules/`
- Custom rules: `/var/ossec/etc/rules/local_rules.xml`
- Decoders: `/var/ossec/etc/decoders/`
- Agent keys: `/var/ossec/etc/client.keys`
- Wazuh config: `/var/ossec/etc/ossec.conf`
- Alerts: `/var/ossec/logs/alerts/alerts.log`

### On Windows Powerhouse
- Wazuh agent: `C:\Program Files (x86)\ossec-agent\`
- Agent config: `C:\Program Files (x86)\ossec-agent\ossec.conf`
- Security Event Log: Event Viewer → Windows Logs → Security
- Sysmon: Event Viewer → Applications and Services Logs → Microsoft → Windows → Sysmon → Operational

### On PRIMARY_OS / MINT-3
- Wazuh agent config: `/var/ossec/etc/ossec.conf`
- Auth log: `/var/log/auth.log`
- Syslog: `/var/log/syslog`
- HawkinsOps workspace: `~/HAWKINS_OPS/`
- Incident folders: `~/HAWKINS_OPS/incidents/`
- Runbooks: `~/HAWKINS_OPS/runbooks/`

### On pfSense
- Firewall log: `/var/log/filter.log`
- System log: `/var/log/system.log`
- Configuration: `/cf/conf/config.xml`
- Access via: Status → System Logs (web UI)

---

## Assumptions & Placeholders

**This document makes assumptions about the HawkinsOps environment. Update as needed:**

- [ ] **pfSense LAN IP**: Assumed `[REDACTED_IP]` - verify actual
- [ ] **Wazuh Server IP**: Placeholder `[REDACTED_IP]` - set actual static IP
- [ ] **Hostnames**: Assumed generic names - update with actual hostnames
- [ ] **VPN Deployment**: Not yet configured - plan for future
- [ ] **IDS/IPS (Suricata)**: Not yet deployed on pfSense - plan for future
- [ ] **Sysmon on Windows**: Assumed not yet deployed - highly recommended
- [ ] **Active Directory**: Not yet implemented - document when deployed
- [ ] **Network Segmentation**: Currently flat LAN - plan VLANs for future
- [ ] **Exact Wazuh Rule IDs**: May vary - verify in actual deployment
- [ ] **Log Retention**: Define retention policy (30 days? 90 days? 1 year?)

**Action Item**: Replace assumptions with actual values during/after HawkinsOps buildout.

---

## Maintenance & Documentation Updates

**This document should be updated when**:
- New systems added to HawkinsOps environment
- IP addresses changed
- Firewall rules modified
- Wazuh custom rules created or updated
- Network segmentation implemented
- Active Directory deployed
- Services added or removed

**Version Control**: Consider using git to track changes to this document.

**Ownership**: Primary SOC analyst (Raylee) maintains this document.

**Last Updated**: [Date of creation - update as needed]

---

## Quick Reference: System Access

| System | Web/SSH Access | Credentials | Purpose |
|--------|---------------|-------------|---------|
| pfSense | https://[REDACTED_IP]:443 | admin / [set during setup] | Firewall management |
| Wazuh Dashboard | https://[REDACTED_IP]:443 | wazuh-user / [configured] | SIEM dashboard |
| Windows Powerhouse | RDP: [REDACTED_IP]:3389 | [Windows account] | Remote desktop |
| PRIMARY_OS | SSH: [REDACTED_IP]:22 | [Linux user] | Remote shell |
| MINT-3 | SSH: [REDACTED_IP]:22 | [Linux user] | Remote shell |

**Security Note**: Store credentials in password manager. Rotate regularly. Use SSH keys for Linux access. Implement MFA where possible.

---

**End of HawkinsOps Environment Mapping**

