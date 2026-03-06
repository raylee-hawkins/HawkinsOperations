# Phase 0 Discovery Log - 03-05-2026

Repository: C:\RH\OPS\10_Portfolio\HawkinsOperations

## 0.1 Current Directory

~~~powershell
Get-Location
~~~

~~~text

Path
----
C:\RH\OPS\10_Portfolio\HawkinsOperations
~~~

## Plan PDF Presence

~~~powershell
$pdf="C:\RH\OPS\30_PROJECTS\WEBSITE REDESIGN\hawkinsops-redesign-plan.pdf"; if (Test-Path -LiteralPath $pdf) { "PDF_FOUND: $pdf" } else { "PDF_MISSING: $pdf" }
~~~

~~~text
PDF_FOUND: C:\RH\OPS\30_PROJECTS\WEBSITE REDESIGN\hawkinsops-redesign-plan.pdf
~~~

## Plan PDF Read Attempt

~~~powershell
python (pypdf extraction attempt)
~~~

~~~text
PDF_READ_FAIL
ModuleNotFoundError: No module named 'pypdf'
~~~

## 0.2 HTML Inventory

~~~powershell
Get-ChildItem -Path .\site -Filter *.html -File -Recurse | Select-Object -ExpandProperty FullName | Sort-Object
~~~

~~~text
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\404.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\blog-python2-to-python3.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-autosoc.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-cve-patch.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-detection-harness.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-honeypot.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-ir-howe01.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-ir-playbooks.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-sigma-library.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study-soc-integration.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\case-study.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\detections.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\honeypot-proof.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\index.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\lab.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\march-2026-release.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\partials\footer.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\partials\nav.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\projects.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\proof.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\resume.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\security.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\soc-lab.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\triage.html
C:\RH\OPS\10_Portfolio\HawkinsOperations\site\wildcard.html
~~~

## 0.2 Scripts Inventory

~~~powershell
Get-ChildItem -Path .\scripts -File -Recurse | Where-Object { $_.Extension -in '.js','.py','.ps1' } | Select-Object -ExpandProperty FullName | Sort-Object
~~~

~~~text
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\auto-soc\coverage-check.py
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\build-site-includes.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\build-wazuh-bundle.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\deploy_wazuh_pack.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\diagnose-site.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\diagnose-site.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\drift_scan.py
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\generate_verified_counts.py
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\generate-media-manifest.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\generate-site-content.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\generate-site-data.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\publish\promote-autosoc.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\runs\build_march_truth_index.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\runs\build_run_manifest.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\runs\build_runs_index.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\runs\validate_runs_contract.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\smoke-production.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\smoke-production.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\validate_wazuh_pack.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\autosoc-publish-contract-scan.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\generate-verified-counts.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\hosting-cloudflare-only.js
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\install-precommit-public-safety.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\public-safety-scan.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\repo-state-grade.ps1
C:\RH\OPS\10_Portfolio\HawkinsOperations\scripts\verify\verify-counts.ps1
~~~

## 0.2 PROOF_PACK Inventory

~~~powershell
Get-ChildItem -Path .\PROOF_PACK -File -Recurse | Select-Object -ExpandProperty FullName | Sort-Object
~~~

~~~text
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\ARCHITECTURE.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\BINDER_01_STRATEGY.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\BINDER_02_EXECUTION.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\DIAGRAMS\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE_CHECKLIST.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\baseline.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\burn_result.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\dmesg_post.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\gpu_passthrough_report_02-11-2026.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\gpu-burn_600s.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\health_summary.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\INDEX.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\journalctl-k-2026-02-03.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\journalctl-k-burn-window-2026-02-11.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\journalctl-k-burn-window-filtered-2026-02-11.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\journalctl-k-current-boot.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\journalctl-k-current-filtered.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\journalctl-k-filtered.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\lspci-nnk.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\nvidia-smi-L.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\nvidia-smi-q.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\nvidia-smi.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\proofpack_gpu_passthrough_SANITIZED_02-11-2026.tar.gz
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\SANITIZATION_NOTES.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\telemetry_20260211T113041Z.csv
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\gpu_passthrough_vm102_2026-02-11\telemetry.csv
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-051-multiple-auth-failures.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-052-file-integrity-critical-system.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-053-rootkit-detection.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-055-malware-detection-virustotal.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-056-process-anomaly-detection.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-057-windows-defender-disabled.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-058-suspicious-powershell-download.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-059-new-service-creation.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-061-port-scan-detection.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-065-aws-s3-bucket-public-exposure.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-066-linux-suspicious-sudo-password-change.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-067-dns-tunneling-detection.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-070-registry-autorun-modification.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-072-kerberoasting-detection.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\legacy\wazuh-075-credential-dumping-comsvcs.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11_SANITIZED.tar.gz
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\container-nvidia-smi-L.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\devices-paired.json
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\devices-pending.json
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\docker-compose.yml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\docker-info.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\docker-ps.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\docker-service-status.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\gateway-probe.json
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\gateway-ui-http.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\INDEX.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\nvidia-cdi-lib-paths.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\openclaw-config-sanitized.json
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\openclaw-health.json
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\openclaw-user-service-status.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\SANITIZATION_NOTES.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\openclaw_docker_vm102_2026-02-11\summary.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EVIDENCE\screenshots\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\EXECUTION_LOG.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase5-external-profile-doc\run_02-14-2026_004705\evidence\logs\file-tree-snippet.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase5-external-profile-doc\run_02-14-2026_004705\evidence\logs\git-status.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase5-external-profile-doc\run_02-14-2026_004705\RESULTS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase6a-infra-validation-doc\run_02-14-2026_010351\evidence\logs\file-tree-snippet.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase6a-infra-validation-doc\run_02-14-2026_010351\evidence\logs\git-status.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase6a-infra-validation-doc\run_02-14-2026_010351\evidence\screenshots\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\phase6a-infra-validation-doc\run_02-14-2026_010351\RESULTS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\local_content_checks_resume_txt_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\local_headers_resume_html_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\local_server_output_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\local_visual_capture_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\prod_headers_legacy_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\prod_headers_resume_page_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\prod_headers_resume_txt_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\prod_probe_resume_txt_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\logs\runner_run_path_control.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\screenshots\resume_txt_render_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\evidence\screenshots\resume_with_ats_link_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\features\resume-ats-txt-endpoint\run_02-14-2026_000051\RESULTS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\CF_PAGES_PROJECT_SETTINGS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\CRAWLABILITY_AND_BOT_ACCESS_VALIDATION_02-24-2026.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\DEPLOY_LOG_LINKS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\DETERMINISTIC_DEPLOY_MARKERS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\DNS_CUTOVER_RECORDS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\PHASE_CHECKLIST.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\RELEASE_READY_CHECKLIST_02-24-2026.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\ROLLBACK_PLAN_AND_TRIGGER.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\ROUTING_AND_HEADERS_VALIDATION.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_191244\evidence\logs\.gitkeep
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_191244\evidence\logs\dns_resolver_capture_02-14-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_191244\evidence\logs\prod_headers_capture_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_191244\evidence\screenshots\.gitkeep
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\.gitkeep
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_headers_legacy_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_headers_legacy_follow_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_headers_pdf_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_headers_pdf_ios_ua_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_headers_resume_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_headers_resume_ios_ua_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_pdf_download_behavior_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\prod_pdf_download_behavior_ios_ua_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\static_redirect_rules_validation_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\static_resume_print_css_checks_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\logs\sanitized\static_resume_ux_checks_02-13-2026.txt
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\resume_desktop_prod_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\resume_mobile_ios_ua_prod_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\resume_pdf_mobile_ios_ua_prod_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\resume_pdf_open_prod_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\resume_print_preview_prod_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\evidence\screenshots\resume_print_render_prod_02-14-2026.pdf
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-13-2026_232415\RESULTS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\.gitkeep
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\404_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\home_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\lab_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\projects_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\proof_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\resume_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\security_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\evidence\screenshots\triage_02-14-2026.png
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\hosting_transfer_cloudflare\run_02-14-2026_031137\RESULTS.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\PROOF_INDEX.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\REDACTION_RULES.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\ROOTCHECK\linkedin_carousel_script_03-02-2026.docx
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\ROOTCHECK\README.docx
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\ROOTCHECK\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\ROOTCHECK\transfer_sftp_rootcheck_sanitized_manifest_03-02-2026.docx
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\ROOTCHECK\transfer_sftp_rootcheck_sanitized_manifest_03-02-2026.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\credential_dumping_tools.yml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\encoded_powershell.yml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\ir_sample_01.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\IR-001-LSASS-Access.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\sigma_sample_01.yml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\splunk_sample_01.spl
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SAMPLES\wazuh_sample_01.xml
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\SCREENSHOTS\README.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\site_link_inventory.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\site_qa_report.md
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\verified_counts.json
C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\VERIFIED_COUNTS.md
~~~

## 0.3 verified_counts.json

~~~powershell
if (Test-Path -LiteralPath .\PROOF_PACK\verified_counts.json) { Get-Content .\PROOF_PACK\verified_counts.json }
~~~

~~~text
{
  "generated_at_utc": "2026-02-26T15:32:56+00:00",
  "source_path": "PROOF_PACK/VERIFIED_COUNTS.md",
  "counts": {
    "sigma": 103,
    "splunk": 8,
    "wazuh_xml_files": 24,
    "wazuh": 28,
    "ir": 10,
    "detections": 139
  },
  "source_refs": {
    "sigma": {
      "file": "PROOF_PACK/VERIFIED_COUNTS.md",
      "line": 11,
      "heading": "Detection Rules"
    },
    "splunk": {
      "file": "PROOF_PACK/VERIFIED_COUNTS.md",
      "line": 12,
      "heading": "Detection Rules"
    },
    "wazuh_xml_files": {
      "file": "PROOF_PACK/VERIFIED_COUNTS.md",
      "line": 13,
      "heading": "Detection Rules"
    },
    "wazuh": {
      "file": "PROOF_PACK/VERIFIED_COUNTS.md",
      "line": 13,
      "heading": "Detection Rules"
    },
    "ir": {
      "file": "PROOF_PACK/VERIFIED_COUNTS.md",
      "line": 19,
      "heading": "Incident Response"
    },
    "detections": {
      "file": "PROOF_PACK/VERIFIED_COUNTS.md",
      "line": 13,
      "heading": "Detection Rules"
    }
  }
}
~~~

## 0.4 Generator Script (First 120 Lines)

~~~powershell
Get-Content -Path .\scripts\generate-site-data.js -TotalCount 120
~~~

~~~text
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcPath = path.join(root, "PROOF_PACK", "VERIFIED_COUNTS.md");
const canonicalOutPath = path.join(root, "PROOF_PACK", "verified_counts.json");
const siteOutPath = path.join(root, "site", "assets", "verified-counts.json");
const detectionsDataPath = path.join(root, "site", "assets", "data", "detections.json");
const withProofPack = process.argv.includes("--with-proof-pack");

function readMatch(lines, regex) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = line.match(regex);
    if (m) return { lineNo: i + 1, match: m };
  }
  return null;
}

function headingForLine(lines, lineNo) {
  let heading = "";
  for (let i = 0; i < lineNo; i += 1) {
    if (lines[i].startsWith("## ")) heading = lines[i].slice(3).trim();
  }
  return heading;
}

function parseVerifiedCountsMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sigmaHit = readMatch(lines, /\|\s*\*\*Sigma\*\*.*\|\s*\*\*(\d+)\*\*\s+rules/i);
  const splunkHit = readMatch(lines, /\|\s*\*\*Splunk\*\*.*\|\s*\*\*(\d+)\*\*\s+queries/i);
  const wazuhHit = readMatch(
    lines,
    /\|\s*\*\*Wazuh\*\*.*\|\s*\*\*(\d+)\*\*\s+files,\s*\*\*(\d+)\*\*\s+rule blocks/i
  );
  const irHit = readMatch(lines, /\|\s*\*\*IR Playbooks\*\*.*\|\s*\*\*(\d+)\*\*\s+playbooks/i);

  if (!sigmaHit || !splunkHit || !wazuhHit || !irHit) {
    throw new Error("Could not parse one or more required count rows from PROOF_PACK/VERIFIED_COUNTS.md");
  }

  const sigma = Number(sigmaHit.match[1]);
  const splunk = Number(splunkHit.match[1]);
  const wazuhXmlFiles = Number(wazuhHit.match[1]);
  const wazuh = Number(wazuhHit.match[2]);
  const ir = Number(irHit.match[1]);
  const detections = sigma + splunk + wazuh;

  const sourceRefs = {
    sigma: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: sigmaHit.lineNo,
      heading: headingForLine(lines, sigmaHit.lineNo)
    },
    splunk: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: splunkHit.lineNo,
      heading: headingForLine(lines, splunkHit.lineNo)
    },
    wazuh_xml_files: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: wazuhHit.lineNo,
      heading: headingForLine(lines, wazuhHit.lineNo)
    },
    wazuh: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: wazuhHit.lineNo,
      heading: headingForLine(lines, wazuhHit.lineNo)
    },
    ir: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: irHit.lineNo,
      heading: headingForLine(lines, irHit.lineNo)
    },
    detections: {
      file: "PROOF_PACK/VERIFIED_COUNTS.md",
      line: wazuhHit.lineNo,
      heading: headingForLine(lines, wazuhHit.lineNo)
    }
  };

  return {
    counts: {
      sigma,
      splunk,
      wazuh_xml_files: wazuhXmlFiles,
      wazuh,
      ir,
      detections
    },
    source_refs: sourceRefs
  };
}

function syncDetectionsData(counts) {
  if (!fs.existsSync(detectionsDataPath)) return;
  const raw = fs.readFileSync(detectionsDataPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.detections)) return;

  const map = {
    sigma: counts.sigma,
    wazuh: counts.wazuh,
    splunk: counts.splunk,
    "ir-playbooks": counts.ir
  };

  let changed = false;
  parsed.detections.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const next = map[entry.id];
    if (typeof next === "number" && entry.count !== next) {
      entry.count = next;
      changed = true;
    }
  });

  if (changed) {
~~~

## 0.5 site/index.html (Full)

~~~powershell
Get-Content -Path .\site\index.html
~~~

~~~text
<!doctype html>
<html lang="en">
<head>
<title>HawkinsOps | Raylee Hawkins | Home</title>
<meta name="description" content="Evidence-first SOC portfolio with verified, reproducible security artifacts. Public counts align to PROOF_PACK/VERIFIED_COUNTS.md.">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#07070b">
<link rel="canonical" href="https://hawkinsops.com/">
<meta property="og:type" content="website">
<meta property="og:title" content="HawkinsOps | Raylee Hawkins | Home">
<meta property="og:description" content="Evidence-first SOC portfolio with verified, reproducible security artifacts. Public counts align to PROOF_PACK/VERIFIED_COUNTS.md.">
<meta property="og:url" content="https://hawkinsops.com/">
<meta property="og:image" content="https://hawkinsops.com/assets/pp_soc_integration/autosoc-system-map.png?v=03-03-2026-1">
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="900">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="HawkinsOps | Raylee Hawkins | Home">
<meta name="twitter:description" content="Evidence-first SOC portfolio with verified, reproducible security artifacts. Public counts align to PROOF_PACK/VERIFIED_COUNTS.md.">
<meta name="twitter:image" content="https://hawkinsops.com/assets/pp_soc_integration/autosoc-system-map.png?v=03-03-2026-1">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <script>
    (function () {
      var saved = null;
      try {
        saved = localStorage.getItem('rh-theme');
      } catch (err) {
        saved = null;
      }
      var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', saved || (sysDark ? 'dark' : 'light'));
    })();
  </script>
  <link rel="stylesheet" href="/assets/styles.css?v=02-24-2026-3">

</head>
<body>
<!-- @include:nav:start -->
<nav>
  <div class="nav-i">
    <a class="logo" href="/"><span class="logo-monogram" aria-hidden="true">RH</span><b>Hawkins</b>Ops</a>
    <button id="mobBtn" class="mob-btn" type="button" aria-expanded="false" aria-controls="mobMenu" aria-label="Toggle site navigation">Menu</button>
    <ul class="nav-l">
      <li><a href="/">Home</a></li>
      <li><a href="/projects">Projects</a></li>
      <li><a href="/case-study-autosoc">AutoSOC Case Study</a></li>
      <li><a href="/detections">Detections</a></li>
      <li><a href="/soc-lab">Lab</a></li>
      <li><a href="/resume">Resume</a></li>
      <li><a href="/proof">Proof</a></li>
    </ul>
    <a class="btn btn-p nav-cta" href="/case-study-autosoc">Read AutoSOC</a>
    <button id="themeToggle" class="theme-btn" type="button" aria-label="Switch to light mode">Light</button>
  </div>
</nav>
<div id="mobMenu" class="mob-menu" data-open="false" role="navigation" aria-label="Mobile site navigation">
  <a href="/">Home</a>
  <a href="/projects">Projects</a>
  <a href="/case-study-autosoc">AutoSOC Case Study</a>
  <a href="/detections">Detections</a>
  <a href="/soc-lab">Lab</a>
  <a href="/resume">Resume</a>
  <a href="/proof">Proof</a>
</div>

<!-- @include:nav:end -->

<main>
<header class="hero">
  <div class="hero-glow"></div>
  <div class="ctr hero-split-ctr">
    <div class="hero-panel">
      <div class="htag">ENTRY-LEVEL SOC | AUTOMATION + DETECTION</div>
      <h1 class="htitle">I built an <span class="hl">AutoSOC pipeline</span> that turns Wazuh alerts into consistent triage decisions and redacted escalation artifacts.</h1>
      <p class="hsub">
        I automated repeatable first-pass SOC triage for Wazuh alerts: classify alerts, redact sensitive data,
        package investigation evidence, and escalate suspicious cases with reviewable GitHub artifacts.
      </p>
      <div class="hctas">
        <a class="btn btn-p" href="/case-study-autosoc">Read AutoSOC Case Study</a>
        <a class="btn btn-g" href="/proof">View Proof</a>
      </div>
      <div class="sbadge"><span class="sdot"></span>Eligible to obtain clearance; willing to pursue sponsorship.</div>
      <div class="lupd">Huntsville-adjacent, North Alabama • SOC Analyst target track</div>
    </div>
    <div class="hero-visual">
      <div class="hero-visual-frame">
        <img src="/assets/pp_soc_integration/autosoc-system-map.svg?v=03-02-2026-2" alt="AutoSOC system map from ingestion through triage and escalation outputs">
      </div>
      <div class="hero-visual-foot">
        <span class="redaction-pill">Identifiers redacted in public artifacts</span>
        <a class="lane-cta" href="/case-study-autosoc" style="text-decoration:none">Open architecture <span>-></span></a>
      </div>
    </div>
  </div>
</header>

<section class="section-tight">
  <div class="ctr home-shell">
    <div class="slbl">Review First</div>
    <h2 class="stitle">Fastest path for SOC hiring review</h2>
    <div class="g3">
      <a class="card lane-card" href="/case-study-autosoc" style="text-decoration:none" data-lane="fastest">
        <span class="lane-tag">START HERE</span>
        <div class="card-ttl">AutoSOC case study</div>
        <div class="card-sub">See the problem, what I built, how decisions are made, and one real incident example.</div>
        <div class="lane-cta" aria-hidden="true">Open lane <span>-></span></div>
      </a>
      <a class="card lane-card" href="/proof" style="text-decoration:none" data-lane="systems">
        <span class="lane-tag">RECEIPTS</span>
        <div class="card-ttl">Proof</div>
        <div class="card-sub">Evidence packs, run logs, release notes, and commit history in one place.</div>
        <div class="lane-cta" aria-hidden="true">Open lane <span>-></span></div>
      </a>
      <a class="card lane-card" href="/resume" style="text-decoration:none" data-lane="source">
        <span class="lane-tag">ROLE FIT</span>
        <div class="card-ttl">Resume</div>
        <div class="card-sub">SOC T1/T2 focus with clear role fit, certifications in progress, and clearance-ready positioning.</div>
        <div class="lane-cta" aria-hidden="true">Open lane <span>-></span></div>
      </a>
    </div>
    <div class="lupd verify-date">Last verified: <span data-verified-date>03-03-2026</span></div>
  </div>
</section>
</main>
<div id="modalBg" class="modal-backdrop" aria-hidden="true">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-h">
      <div id="modalTitle" class="modal-ttl">DETAILS</div>
      <button id="modalClose" class="modal-x" type="button">Close</button>
    </div>
    <div id="modalBody" class="modal-b"></div>
  </div>
</div>
<!-- @include:footer:start -->
<footer>
  <div class="ctr">
    <p><b>HawkinsOps</b> • Huntsville-adjacent (North Alabama)</p>
    <div class="fl">
      <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
      <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
      <a href="mailto:raylee@hawkinsops.com" aria-label="Email Raylee Hawkins">raylee@hawkinsops.com</a>
    </div>
  </div>
</footer>

<!-- @include:footer:end -->
<script src="/assets/fetch-utils.js" defer></script>
<script src="/assets/app.js" defer></script>
</body>
</html>
~~~

