# Scenario 02: SSH Brute-Force Attack on Linux Endpoint

## Environment Context
- **Primary Detection**: Wazuh SIEM + Linux auth logs
- **Affected System**: MINT-3 or PRIMARY_OS (Linux Mint endpoints)
- **HawkinsOps Components Involved**:
  - Linux endpoint with Wazuh agent
  - Wazuh server (aggregation/alerting)
  - pfSense (network visibility, potential blocking)

## Detection

### Wazuh Alert Details
- **Rule ID**: 5712 (Multiple failed SSH login attempts)
- **Rule ID**: 5720 (SSH brute-force attack)
- **Rule Level**: 10-12
- **Event Source**: `/var/log/auth.log` (Debian/Ubuntu)
- **Threshold**: Typically 5+ failed attempts within short timeframe

### Linux Log Indicators
- **Auth Log Location**: `/var/log/auth.log`
- **Common Patterns**:
  ```
  Failed password for invalid user admin from [REDACTED_IP] port 54321 ssh2
  Failed password for root from [REDACTED_IP] port 12345 ssh2
  Connection closed by authenticating user root [REDACTED_IP] port 12345 [preauth]
  ```

### Additional Detection Methods
- **Fail2Ban alerts** (if deployed)
- **Unusual spike in SSH connection attempts** from single IP
- **Multiple usernames attempted** (enumeration behavior)

## Triage Steps

1. **Check Wazuh Alert Details**
   - Note source IP, target username(s), attempt count
   - Check if attack is ongoing or historical

2. **Review Auth Log on Affected Endpoint**
   ```bash
   # Recent failed SSH attempts:
   sudo grep "Failed password" /var/log/auth.log | tail -50

   # Count attempts per IP:
   sudo grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn

   # Check for successful logins from suspicious IP:
   sudo grep "Accepted password" /var/log/auth.log | grep <suspicious_IP>
   ```

3. **Identify Attack Pattern**
   ```bash
   # Extract failed attempts with timestamps:
   sudo grep "Failed password" /var/log/auth.log | grep <IP_address>

   # Check usernames attempted:
   sudo grep "Failed password" /var/log/auth.log | grep <IP_address> | awk '{print $11}' | sort -u

   # Check if attack is still ongoing:
   sudo tail -f /var/log/auth.log | grep "Failed password"
   ```

4. **Check Currently Active SSH Sessions**
   ```bash
   # View active SSH connections:
   who
   w

   # Check all established SSH connections:
   sudo netstat -tnpa | grep 'ESTABLISHED.*sshd'
   # OR with ss:
   sudo ss -tnp | grep sshd

   # Review last successful logins:
   last -n 20
   ```

5. **Verify No Successful Compromise**
   ```bash
   # Check sudo usage:
   sudo grep "sudo:" /var/log/auth.log | tail -20

   # Check for new user accounts:
   sudo grep "useradd\|adduser" /var/log/auth.log

   # Check for modified SSH authorized_keys:
   ls -la ~/.ssh/authorized_keys
   stat ~/.ssh/authorized_keys
   ```

6. **Analyze Attack Source**
   ```bash
   # Whois lookup:
   whois <IP_address>

   # Check IP reputation (if internet-accessible):
   # Visit abuseipdb.com or similar
   # curl https://api.abuseipdb.com/api/v2/check?ipAddress=<IP> --header "Key: <API_KEY>"
   ```

## Investigation Checklist

- [ ] Source IP is external (Internet) or internal (LAN)?
- [ ] Attack targeted specific account or multiple usernames?
- [ ] Any attempts on valid system accounts (root, service accounts, your user)?
- [ ] Were any login attempts successful?
- [ ] Is attacker IP on known-bad lists?
- [ ] Same IP attacking other HawkinsOps endpoints?
- [ ] Attack duration and intensity (hours/days, attempts per minute)?
- [ ] SSH configuration follows best practices (no root login, key-based auth)?
- [ ] Signs of post-exploitation activity if breach suspected?
- [ ] Fail2Ban or similar already blocking the IP?

## Containment Actions

### Immediate Actions:

1. **Block Attacking IP with UFW**
   ```bash
   sudo ufw deny from <IP_address> to any
   sudo ufw status numbered
   ```

2. **Block at pfSense** (more comprehensive)
   - Log into pfSense web interface
   - Firewall → Rules → WAN
   - Add block rule for source IP
   - OR add to firewall alias for bulk blocking

3. **Kill Active Sessions** (if breach suspected)
   ```bash
   # Find PID of suspicious SSH session:
   sudo ps aux | grep sshd | grep <IP_address>

   # Kill the session:
   sudo kill -9 <PID>
   ```

4. **Enable Fail2Ban** (if not already active)
   ```bash
   sudo apt update
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

5. **Disable Password Authentication** (enforce key-based only)
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   # Set: ChallengeResponseAuthentication no
   # Set: PermitRootLogin no

   sudo systemctl restart sshd
   ```

### If Credentials Compromised:

1. **Force password change for affected account**
   ```bash
   sudo passwd <username>
   sudo passwd --expire <username>
   ```

2. **Check and clean authorized_keys**
   ```bash
   cat ~/.ssh/authorized_keys
   # Remove any unfamiliar keys
   nano ~/.ssh/authorized_keys
   ```

3. **Review sudo/su usage**
   ```bash
   sudo grep -E "sudo:|su\[" /var/log/auth.log | tail -50
   ```

4. **Check for persistence mechanisms**
   ```bash
   # Cron jobs:
   crontab -l
   sudo cat /etc/crontab
   ls -la /etc/cron.d/

   # Systemd timers:
   systemctl list-timers --all

   # Startup services:
   systemctl list-unit-files --state=enabled
   ```

## Evidence to Capture

1. **Wazuh Alert Export**
   - Export full alert JSON
   - Save to: `~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/`

2. **Auth Log Excerpts**
   ```bash
   # Extract relevant time window:
   sudo grep "Failed password" /var/log/auth.log > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/auth_failed.log

   # Full auth log snapshot:
   sudo cp /var/log/auth.log ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/auth.log
   sudo cp /var/log/auth.log.1 ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/auth.log.1
   ```

3. **Attack Statistics**
   ```bash
   # Generate summary report:
   echo "=== SSH Brute-Force Attack Summary ===" > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/attack_summary.txt
   echo "Date: $(date)" >> ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/attack_summary.txt
   echo "" >> ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/attack_summary.txt
   echo "Top attacking IPs:" >> ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/attack_summary.txt
   sudo grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -10 >> ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/attack_summary.txt
   ```

4. **Network State Snapshot**
   ```bash
   sudo ss -tnp > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/network_connections.txt
   sudo ufw status numbered > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/ufw_rules.txt
   ```

5. **System State**
   ```bash
   last -n 50 > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/last_logins.txt
   w > ~/HAWKINS_OPS/incidents/YYYY-MM-DD_ssh_bruteforce/current_users.txt
   ```

6. **Screenshots**
   - Wazuh dashboard showing alert volume
   - Terminal output of log analysis

## Closure & Lessons Learned

### Ticket Closure Steps:
1. Verify attacker IP is blocked at firewall
2. Confirm no successful authentication occurred
3. Validate SSH hardening is in place
4. Check that Fail2Ban is active and configured
5. Update Wazuh alert with resolution notes
6. Archive evidence to incidents folder

### Hardening Recommendations:
- **Disable password authentication** entirely (use SSH keys only)
- **Change default SSH port** to non-standard port (security through obscurity layer)
- **Implement Fail2Ban** with aggressive SSH jail configuration
- **Disable root login** via SSH (`PermitRootLogin no`)
- **Use AllowUsers/AllowGroups** in sshd_config to whitelist
- **Consider port knocking** or VPN-only SSH access for critical systems
- **Enable two-factor authentication** for SSH (Google Authenticator PAM module)
- **Implement rate limiting** at pfSense for SSH port
- **Create Wazuh active response** to auto-block brute-force attempts
- **Set up geofencing** if all access should be from specific geographic region
- **Monitor SSH logs** via Wazuh continuously
- **Regular audit** of authorized_keys files across all systems

### Portfolio Notes:
- Document detection → investigation → containment → hardening workflow
- Demonstrate understanding of Linux auth mechanisms
- Show proficiency with log analysis and firewall configuration
- Highlight proactive hardening to prevent future attacks

