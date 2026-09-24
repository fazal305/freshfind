# Security Policy

## Scope

FreshFind is a static, frontend-only site: there is no backend, no database, no server-side code, and no user accounts. All content is served from static files, and the only client-side storage used (`localStorage` for bookmarks, `sessionStorage` for notes) never leaves the visitor's own browser.

Because of this, the realistic attack surface is limited to the frontend code itself — for example, unsafe HTML injection, dependency vulnerabilities in the vendored libraries, or leaking a secret that should never have been committed (this project has none: no API keys are used anywhere).

## Reporting a Vulnerability

If you find a security issue (for example, an XSS vector in how user-entered text — bookmark notes, chatbot input — is rendered), please open an issue describing:

- The affected file/page
- Steps to reproduce
- The potential impact

Please do not open a public issue for anything that could be actively exploited before a fix is available — contact the maintainers directly instead.

## Supported Versions

This is a single-version educational/portfolio project; there are no maintained release branches to patch separately.
