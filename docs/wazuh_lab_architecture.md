# Wazuh Lab Architecture

## Topology

- Wazuh manager: centralized detection/correlation node
- Endpoints: Windows and Linux systems enrolled as agents
- Evidence lane: repository-backed validation + deployment records

## Flow

1. Author and tune rules in `content/wazuh/pack/`.
2. Validate structure and XML integrity with `scripts/validate_wazuh_pack.ps1`.
3. Deploy to manager with `scripts/deploy_wazuh_pack.ps1`.
4. Verify manager health, detection behavior, and evidence output.
5. Iterate suppression/playbook updates based on observed noise and incident outcomes.

## Integration Notes

- Sigma is maintained as portable logic under `content/wazuh/sigma/rules/`.
- Mapping artifacts in `content/wazuh/sigma/mappings/` document conversion into Wazuh rules.
- SPL logic can be referenced for hypothesis parity but is not directly executable in Wazuh.


