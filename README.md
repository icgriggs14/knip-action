# knip-action

> GitHub Action CI companion for [knip](https://github.com/webpro-nl/knip) — automatically detects unused exports, files, and dependencies on every PR.

[![GitHub Stars](https://img.shields.io/github/stars/icgriggs14/knip-action?style=social)](https://github.com/icgriggs14/knip-action)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-knip--action-blue?logo=github)](https://github.com/marketplace/actions/knip-action)
[![knip](https://img.shields.io/badge/powered%20by-knip-purple)](https://github.com/webpro-nl/knip)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github)](https://github.com/sponsors/icgriggs14)

[knip](https://github.com/webpro-nl/knip) is the leading TypeScript dead-code elimination tool (7.97M weekly npm downloads, 11,371 stars). **knip-action** brings it into your CI pipeline — every PR gets automatic dead-code detection, with inline comments and configurable failure gates.

## Quick start

```yaml
# .github/workflows/knip.yml
name: knip

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  knip:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - uses: icgriggs14/knip-action@v1
        with:
          threshold: 0          # fail CI if any unused exports/deps found
          fail_on_error: true
          reporter: compact
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `threshold` | Fail CI if issue count exceeds this (0 = fail on any issue) | `0` |
| `fail_on_error` | Fail CI when knip exits with an error | `true` |
| `reporter` | knip reporter format: `compact`, `json`, `codeowners` | `compact` |
| `github_token` | Token for posting PR comments | `${{ github.token }}` |
| `working_directory` | Directory to run knip in | `.` |

## Outputs

| Output | Description |
|--------|-------------|
| `issue_count` | Total number of knip issues found |
| `passed` | `true` if issues ≤ threshold, `false` otherwise |

## PR comment

knip-action automatically posts a structured PR comment with:
- Pass/fail status
- Issue count vs threshold
- Collapsible knip output

## Why knip in CI?

The [official knip CI guide](https://knip.dev/guides/using-knip-in-ci) endorses GitHub Actions integration — knip exits with code 1 when unused exports/dependencies are found, making it natural to enforce as a CI gate. knip-action is the ready-to-use Action the guide implies.

## Portfolio

- [claude-pr-review](https://github.com/icgriggs14/claude-pr-review) — AI code review on every PR
- [claude-changelog-action](https://github.com/icgriggs14/claude-changelog-action) — AI changelog generation  
- [claude-test-writer](https://github.com/icgriggs14/claude-test-writer) — AI unit test generation
- [react-doctor-action](https://github.com/icgriggs14/react-doctor-action) — React diagnostics CI

## Support

If knip-action saves you time, consider [sponsoring on GitHub](https://github.com/sponsors/icgriggs14). Every contribution helps keep these tools maintained and free.

## License

MIT



## Related

- [knip](https://github.com/webpro-nl/knip) — the underlying tool (7.97M weekly downloads)
- [knip.dev/guides/using-knip-in-ci](https://knip.dev/guides/using-knip-in-ci) — official CI integration guide

## Other Claude AI Tools

These companion tools from the same author work great together:

- **[claude-pr-review](https://github.com/icgriggs14/claude-pr-review)** — AI-powered PR code review using Claude
- **[claude-changelog-action](https://github.com/icgriggs14/claude-changelog-action)** — Auto-generate changelogs from commits using Claude
- **[claude-test-writer](https://github.com/icgriggs14/claude-test-writer)** — AI unit test generation CLI + GitHub Action
- **[react-doctor-action](https://github.com/icgriggs14/react-doctor-action)** — CI health checks for React projects
- **[secretlint-action](https://github.com/icgriggs14/secretlint-action)** — CI credential leak detection using secretlint

[Sponsor this work on GitHub Sponsors](https://github.com/sponsors/icgriggs14)
