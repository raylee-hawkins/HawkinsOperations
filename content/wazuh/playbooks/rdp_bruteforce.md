# Playbook: RDP Brute Force

## Trigger
- Repeated authentication failures from one source in short timeframe.

## Steps
1. Confirm target endpoint(s), source IP, and timeframe.
2. Verify if source is internal test traffic or expected scanner activity.
3. Check account lockouts and correlated auth telemetry.
4. Apply containment (host/network/user) based on scope.
5. Document remediation and verification evidence.

