# Crawlability and Bot Access Validation

Date (UTC): 2026-02-24T07:27:37Z

## Redirect and Crawl Endpoint Checks
- https://www.hawkinsops.com/robots.txt -> HTTP/1.1 301 Moved Permanently
  Location: https://hawkinsops.com/robots.txt
- https://www.hawkinsops.com/sitemap.xml -> HTTP/1.1 301 Moved Permanently
  Location: https://hawkinsops.com/sitemap.xml
- https://hawkinsops.com/robots.txt -> HTTP/1.1 200 OK
- https://hawkinsops.com/sitemap.xml -> HTTP/1.1 200 OK

## Bot User-Agent Access Checks
- ClaudeBot https://hawkinsops.com/ -> HTTP/1.1 200 OK
- ClaudeBot https://hawkinsops.com/projects -> HTTP/1.1 200 OK
- ClaudeBot https://hawkinsops.com/security -> HTTP/1.1 200 OK
- ClaudeBot https://hawkinsops.com/robots.txt -> HTTP/1.1 200 OK
- ClaudeBot https://hawkinsops.com/sitemap.xml -> HTTP/1.1 200 OK
- GPTBot https://hawkinsops.com/ -> HTTP/1.1 200 OK
- GPTBot https://hawkinsops.com/projects -> HTTP/1.1 200 OK
- GPTBot https://hawkinsops.com/security -> HTTP/1.1 200 OK
- GPTBot https://hawkinsops.com/robots.txt -> HTTP/1.1 200 OK
- GPTBot https://hawkinsops.com/sitemap.xml -> HTTP/1.1 200 OK

## Result
- www host redirects to apex for crawl endpoints (301).
- Apex robots.txt and sitemap.xml return 200.
- ClaudeBot and GPTBot return 200 on homepage, key pages, and crawl endpoints.
