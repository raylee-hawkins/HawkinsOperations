# Linux Threat Hunting Queries

## Hunt 31: Suspicious Cron Jobs
**MITRE:** T1053.003
```bash
# List all cron jobs
for user in $(cut -f1 -d: /etc/passwd); do
    echo "Cron jobs for $user:"
    crontab -u $user -l 2>/dev/null
done

# Check cron directories
cat /etc/crontab
ls -la /etc/cron.* /var/spool/cron/crontabs/

# Recent cron modifications
find /etc/cron* /var/spool/cron -type f -mtime -7 -ls
```
**False Positives:** Legitimate scheduled tasks, backups
**Triage:** Review cron command; check file paths; verify user authorization

## Hunt 32: Unauthorized SSH Keys
**MITRE:** T1098.004
```bash
# Check authorized_keys for all users
for dir in /home/*/.ssh /root/.ssh; do
    if [ -f "$dir/authorized_keys" ]; then
        echo "=== $dir/authorized_keys ==="
        cat "$dir/authorized_keys"
        stat "$dir/authorized_keys"
    fi
done

# Recent modifications to SSH keys
find / -name "authorized_keys" -mtime -30 2>/dev/null

# Check SSH config for suspicious settings
cat /etc/ssh/sshd_config | grep -v "^#"
```
**False Positives:** Legitimate key additions
**Triage:** Verify key ownership; check when added; validate user

## Hunt 33: Suspicious User Accounts
**MITRE:** T1136.001
```bash
# Accounts with UID 0 (root privileges)
awk -F: '$3 == 0 {print $1}' /etc/passwd

# Recently created users
grep "useradd\|adduser" /var/log/auth.log* | tail -20

# Users with empty passwords
awk -F: '($2 == "") {print $1}' /etc/shadow

# Sudoers modifications
ls -la /etc/sudoers.d/
cat /etc/sudoers

# Check last modifications
stat /etc/passwd /etc/shadow /etc/group
```
**False Positives:** Legitimate admin activities
**Triage:** Verify account creation authority; check account purpose; review permissions

## Hunt 34: Suspicious Process Execution
**MITRE:** T1059.004
```bash
# Processes running from /tmp or /dev/shm
ps aux | grep -E "/tmp/|/dev/shm/"

# Processes with deleted executables
ls -la /proc/*/exe 2>/dev/null | grep deleted

# Suspicious bash/sh executions
ps aux | grep -E "bash -i|sh -i|/dev/tcp|/dev/udp|nc -l|ncat"

# Processes running as root from unusual locations
ps aux | awk '$1=="root" && $11!~/^\/usr\/|^\/sbin\/|^\/bin\// {print}'
```
**False Positives:** Temporary scripts, updates
**Triage:** Check process ancestry; review command line; verify file hash

## Hunt 35: Persistence via Init Scripts
**MITRE:** T1037.004
```bash
# Check systemd services
systemctl list-unit-files --type=service | grep enabled

# Recently modified services
find /etc/systemd/system /usr/lib/systemd/system -type f -mtime -30

# Init.d scripts
ls -la /etc/init.d/
find /etc/init.d/ -type f -mtime -30

# RC scripts
ls -la /etc/rc*.d/

# Check for suspicious service content
for service in /etc/systemd/system/*.service; do
    echo "=== $service ==="
    cat "$service"
done
```
**False Positives:** Software installations, updates
**Triage:** Review service content; check exec paths; verify service purpose

## Hunt 36: Shell Profile Modifications
**MITRE:** T1546.004
```bash
# Check profile files for all users
for profile in /home/*/.bashrc /home/*/.bash_profile /home/*/.profile /root/.bashrc /root/.bash_profile /etc/profile /etc/bash.bashrc; do
    if [ -f "$profile" ]; then
        echo "=== $profile ==="
        cat "$profile"
        stat "$profile"
    fi
done

# Recently modified profiles
find /home /root /etc -name ".bashrc" -o -name ".bash_profile" -o -name ".profile" -mtime -30 2>/dev/null
```
**False Positives:** User customizations
**Triage:** Review added content; check for suspicious commands; verify user

## Hunt 37: Suspicious Network Connections
**MITRE:** T1071
```bash
# Current network connections
netstat -antp
ss -antp

# Listening services
netstat -plant | grep LISTEN
ss -lntp

# Unusual ports
netstat -plant | awk '{print $4}' | sed 's/.*://' | sort -u | grep -v "^$"

# Processes with network connections
lsof -i -P -n

# Check for reverse shells
netstat -antp | grep -E "ESTABLISHED.*:(4444|31337|1337|8080)"
```
**False Positives:** Legitimate services, applications
**Triage:** Identify process; check destination IP reputation; review port usage

## Hunt 38: Webshell Detection
**MITRE:** T1505.003
```bash
# Search for common webshell patterns
find /var/www /usr/share/nginx /opt/lampp/htdocs -type f \( -name "*.php" -o -name "*.jsp" -o -name "*.asp" -o -name "*.aspx" \) -mtime -30 | while read file; do
    grep -l "eval\|base64_decode\|system\|exec\|shell_exec\|passthru" "$file" && echo "Suspicious: $file"
done

# Recently modified web files
find /var/www /usr/share/nginx -type f -mtime -7 -ls

# Check for suspicious PHP functions
grep -r "eval(" /var/www/ 2>/dev/null
grep -r "base64_decode" /var/www/ 2>/dev/null
grep -r "system(" /var/www/ 2>/dev/null
```
**False Positives:** Legitimate PHP/JSP code, updates
**Triage:** Review file content; check creation date; verify web admin authorization

## Hunt 39: Kernel Module Persistence
**MITRE:** T1547.006
```bash
# List loaded kernel modules
lsmod

# Recently loaded modules
dmesg | grep -i "module"

# Check for unsigned modules (if Secure Boot)
modinfo -F filename $(lsmod | awk 'NR>1 {print $1}') | while read mod; do
    echo "Module: $mod"
    modinfo "$mod" | grep -E "sig|signer"
done

# Persistent module loading
cat /etc/modules
cat /etc/modprobe.d/*
ls -la /etc/modules-load.d/
```
**False Positives:** Legitimate drivers, hardware modules
**Triage:** Verify module purpose; check signature; review loading mechanism

## Hunt 40: File Integrity Anomalies
**MITRE:** T1036, T1070
```bash
# Files with unusual timestamps
find / -type f -newermt "2030-01-01" 2>/dev/null
find / -type f ! -newermt "1990-01-01" 2>/dev/null

# SUID/SGID binaries
find / -perm -4000 -type f 2>/dev/null
find / -perm -2000 -type f 2>/dev/null

# World-writable files
find / -type f -perm -002 2>/dev/null

# Hidden files in unusual locations
find /tmp /var/tmp /dev/shm -name ".*" 2>/dev/null
```
**False Positives:** Legitimate system files
**Triage:** Compare against baseline; check file purpose; verify ownership

## Hunt 41: Log Tampering
**MITRE:** T1070.002
```bash
# Check log file modifications
stat /var/log/auth.log /var/log/secure /var/log/syslog /var/log/messages

# Look for log clearing
journalctl --list-boots
last -f /var/log/wtmp
last -f /var/log/btmp

# Check for deleted logs still open by processes
lsof +L1 | grep "\.log"

# Audit log integrity
ausearch -m LOG
```
**False Positives:** Log rotation, maintenance
**Triage:** Check for gaps in logs; review system activity during log modification

## Hunt 42: LD_PRELOAD Hijacking
**MITRE:** T1574.006
```bash
# Check LD_PRELOAD environment variable
env | grep LD_PRELOAD

# Check for ld.so.preload
cat /etc/ld.so.preload 2>/dev/null

# Process-specific LD_PRELOAD
for pid in $(ps aux | awk '{print $2}' | grep -v PID); do
    cat /proc/$pid/environ 2>/dev/null | tr '\0' '\n' | grep LD_PRELOAD
done
```
**False Positives:** Debugging tools, testing environments
**Triage:** Verify preloaded library; check process legitimacy; review library content

## Hunt 43: Packet Sniffing
**MITRE:** T1040
```bash
# Processes in promiscuous mode
ip link | grep PROMISC

# Check for tcpdump/wireshark
ps aux | grep -E "tcpdump|wireshark|tshark"

# Look for packet capture files
find / -name "*.pcap" -o -name "*.cap" 2>/dev/null

# Check network interface status
ifconfig -a | grep -i promisc
```
**False Positives:** Authorized network monitoring, troubleshooting
**Triage:** Verify authorization; check user running sniffer; review capture files

## Hunt 44: Docker/Container Escape
**MITRE:** T1611
```bash
# List running containers
docker ps -a

# Check for privileged containers
docker inspect $(docker ps -q) | grep -i privileged

# Check for host namespace access
docker inspect $(docker ps -q) | grep -E "\"Pid\"|\"Network\"|\"IPC\""

# Suspicious container mounts
docker inspect $(docker ps -q) | grep -A 5 "Mounts"

# Check for Docker socket access
docker inspect $(docker ps -q) | grep "/var/run/docker.sock"
```
**False Positives:** Legitimate container operations, CI/CD
**Triage:** Review container configuration; check image source; verify permissions

## Hunt 45: SSH Tunneling
**MITRE:** T1572
```bash
# SSH processes with port forwarding
ps aux | grep ssh | grep -E "\-L|\-R|\-D"

# Check SSH logs for tunneling
grep -E "Tunnel|forwarding" /var/log/auth.log

# Active SSH connections
netstat -antp | grep :22 | grep ESTABLISHED

# Check for reverse SSH tunnels
ps aux | grep "ssh.*-R"
```
**False Positives:** Legitimate SSH tunneling, DevOps activities
**Triage:** Verify user authorization; check tunnel destination; review purpose

## Hunt 46: Binary Replacement
**MITRE:** T1036.003
```bash
# Compare system binaries against package manager
rpm -Va 2>/dev/null  # RedHat/CentOS
debsums -c 2>/dev/null  # Debian/Ubuntu

# Check common binary hashes
for bin in /bin/ls /usr/bin/ps /bin/netstat /usr/bin/top /bin/cat; do
    echo "$bin: $(sha256sum $bin)"
done

# Look for binaries in unusual locations
find /tmp /var/tmp /dev/shm -type f -executable 2>/dev/null
```
**False Positives:** System updates, custom builds
**Triage:** Compare against known good hash; check modification time; verify signature

## Hunt 47: Command History Anomalies
**MITRE:** T1552.003
```bash
# Check bash history for all users
for dir in /home/* /root; do
    if [ -f "$dir/.bash_history" ]; then
        echo "=== History for $(basename $dir) ==="
        cat "$dir/.bash_history" | grep -E "wget|curl|nc|base64|chmod.*777|rm -rf|history -c"
    fi
done

# Check for history file manipulation
for dir in /home/* /root; do
    stat "$dir/.bash_history" 2>/dev/null
    ls -la "$dir/.bash_history" 2>/dev/null
done
```
**False Positives:** Normal command usage
**Triage:** Look for suspicious patterns; check timestamps; review cleared history

## Hunt 48: Rootkit Indicators
**MITRE:** T1014, T1564.001
```bash
# Run rkhunter
rkhunter --check --skip-keypress

# Run chkrootkit
chkrootkit

# Check for hidden processes (compare ps and /proc)
ps aux | wc -l
ls /proc | grep -E "^[0-9]+$" | wc -l

# Look for hidden files
find / -name ".. *" -o -name ".  *" 2>/dev/null
```
**False Positives:** False positives from rootkit scanners
**Triage:** Manual verification; check kernel modules; review system binaries

## Hunt 49: Suspicious DNS Queries
**MITRE:** T1071.004
```bash
# Review DNS query logs
cat /var/log/syslog | grep dnsmasq
journalctl -u systemd-resolved | tail -100

# Check /etc/hosts for suspicious entries
cat /etc/hosts | grep -v "^#"

# DNS resolution configuration
cat /etc/resolv.conf

# Check for DNS tunneling (long queries)
tcpdump -i any -n port 53 -vv 2>/dev/null
```
**False Positives:** Legitimate DNS traffic, CDN usage
**Triage:** Check query length; verify destination; review frequency

## Hunt 50: Data Exfiltration via HTTP/S
**MITRE:** T1048.003
```bash
# Large outbound HTTP/S transfers
netstat -antp | grep -E ":(80|443)" | grep ESTABLISHED

# Review web proxy logs
tail -100 /var/log/squid/access.log

# Check for curl/wget usage
ps aux | grep -E "curl|wget"
history | grep -E "curl|wget"

# Large file transfers
lsof -i | grep -E "curl|wget" | awk '{print $2}' | while read pid; do
    ls -lh /proc/$pid/fd/ 2>/dev/null
done
```
**False Positives:** Updates, legitimate file transfers
**Triage:** Check destination; verify data size; review user authorization

