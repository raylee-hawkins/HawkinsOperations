# Honeypot + Grafana + Wazuh (Minimal)

## Proxmox DMZ Guidance
- Place the honeypot VM or container on a DMZ bridge/network segment.
- Do not allow DMZ to initiate connections to LAN.
- Allow only the minimum inbound ports to the honeypot (SSH/Telnet on the honeypot-facing IP).
- Allow the honeypot to send logs to Wazuh (agent -> manager) and Grafana to reach the Wazuh Indexer.

## Wazuh Agent (If Honeypot Is Not Containerized)
1. Install the Wazuh agent on the honeypot VM using Wazuh’s official install instructions.
2. Configure the agent to point to your Wazuh manager.
3. Start the agent service and verify it is reporting in the Wazuh UI.

## Wazuh Agent Localfile Config (Cowrie Logs)
Add a localfile block to the agent configuration on the honeypot VM:
```xml
<localfile>
  <log_format>json</log_format>
  <location>/var/log/cowrie/cowrie.json</location>
</localfile>
```
If your Cowrie logs are in a different path, update the `location` accordingly.

## Verify Cowrie Events In Wazuh Indexer
Example OpenSearch/Lucene queries for Discover:
- `rule.groups:cowrie`
- `data.cowrie.session:*`
- `data.username:* AND rule.groups:cowrie`

If results are empty:
- Confirm Cowrie is writing to the expected log path.
- Confirm the Wazuh agent localfile is configured and the agent is connected.
- Confirm the Wazuh manager is receiving and decoding Cowrie JSON logs.

## Stack Bring-Up Notes
- Docker requires either `sudo` or membership in the `docker` group.
- If `docker compose up` fails with a permission error, add your user to the docker group and re-login:
  - `sudo usermod -aG docker <username>`
