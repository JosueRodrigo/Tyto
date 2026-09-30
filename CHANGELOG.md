# Changelog

All notable Tyto changes will be documented in this file. Releases follow Semantic Versioning.

## Unreleased

### Added

- A new Tyto interface and project-scoped monitoring experience.
- Hardened ingestion with payload limits, rate limiting, and idempotency.
- Retention, rollups, onboarding, MCP access, and operational dashboards.
- Automated server and agent quality gates.

### Changed

- Product and package references now use the Tyto name.
- The standalone monitoring package is maintained in `JosueRodrigo/tyto-agent`.

### Security

- Sensitive telemetry and MCP output are sanitized before storage or transport.
