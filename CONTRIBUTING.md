# Contributing to FreshFind

Thanks for your interest in improving FreshFind.

## Getting started

No build step or dependencies are required. Clone the repository and serve the project root with any static file server (see the Installation section in [README.md](README.md)).

## Making changes

- Keep the project frontend-only: no backend, no database, no build tooling. Data lives in `data/*.json` and is read-only.
- Follow the existing structure: reusable render functions in `js/components/`, one render function per route in `js/pages/`, pure logic in `js/utils/`.
- Match the existing code style (no comments unless something is genuinely non-obvious, plain ES modules, jQuery for DOM updates).
- Test your change by hand in a browser: check the affected route, its empty/error states, and mobile width (375px) before opening a pull request.

## Submitting changes

1. Fork the repository and create a branch for your change.
2. Make your change and verify it manually in a browser.
3. Open a pull request describing what changed and why.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, and what happened instead.
