# GitHub Actions Workflows

This directory contains automated workflows for the RoboTrader project.

## Available Workflows

### 🔒 Security Scan (`security-scan.yml`)

**Triggers**: Push, Pull Request, Weekly (Sundays), Manual

**What it does**:
- Scans for accidentally committed secrets (API keys, tokens)
- Checks for `.env` files in repository
- Audits npm and Python dependencies for vulnerabilities
- Runs Docker security scanning with Trivy

**Why it's critical**: Prevents API key leaks that could compromise your trading account!

---

### 📚 Documentation Validation (`documentation.yml`)

**Triggers**: When markdown files change, Manual

**What it does**:
- Lints all markdown files for consistency
- Checks all links in documentation for broken URLs
- Validates README.md has essential sections
- Checks CLAUDE.md structure
- Validates code blocks in documentation

**Badge**: ![Documentation](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/documentation.yml/badge.svg)

---

### 🐳 Docker Validation (`docker-validation.yml`)

**Triggers**: When Docker files change, Manual

**What it does**:
- Validates `docker-compose.yml` syntax
- Lints Dockerfiles with Hadolint
- Tests Docker configuration
- Scans for Docker security issues
- Checks best practices (restart policies, healthchecks, etc.)

**Badge**: ![Docker](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/docker-validation.yml/badge.svg)

---

### 📦 Dependency Updates (`dependency-updates.yml`)

**Triggers**: Weekly (Mondays), Manual

**What it does**:
- Checks for npm package updates
- Checks for Python package updates
- Checks for Docker image updates
- Creates GitHub issues with update recommendations
- Auto-merges Dependabot patch updates

**Why it's useful**: Keeps your trading system secure and up-to-date automatically!

---

### ✅ Continuous Integration (`ci.yml`)

**Triggers**: Push, Pull Request, Manual

**What it does**:
- Validates required project files exist
- Checks for large files and line endings
- Scans for TODO/FIXME comments
- Runs frontend linting and tests (when available)
- Runs Python linting and tests (when available)
- Checks for broken symlinks

**Badge**: ![CI](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/ci.yml/badge.svg)

---

## Workflow Status

You can see the status of all workflows on the [Actions tab](../../actions) of your repository.

## Adding Badges to README

Add these badges to your main README.md:

```markdown
![Security](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/security-scan.yml/badge.svg)
![Documentation](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/documentation.yml/badge.svg)
![Docker](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/docker-validation.yml/badge.svg)
![CI](https://github.com/YOUR_USERNAME/RoboTrader/actions/workflows/ci.yml/badge.svg)
```

Replace `YOUR_USERNAME` with your GitHub username.

## Manual Triggers

All workflows can be triggered manually:
1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**

## Workflow Permissions

Some workflows require specific permissions:
- **Security Scan**: Needs code read access
- **Dependency Updates**: Needs issues write access
- **All workflows**: Run automatically in GitHub-hosted runners (free for public repos)

## Disabling Workflows

To disable a workflow temporarily:
1. Go to **Actions** → Select workflow
2. Click the **⋮** menu → **Disable workflow**

Or delete the `.yml` file from this directory.

## Troubleshooting

### Workflow fails immediately
- Check the YAML syntax: `yamllint .github/workflows/`
- Look for typos in job names or dependencies

### Secret scanning false positives
- Update the patterns in `security-scan.yml`
- Add exceptions using `-- ':!exclude_pattern'` in grep

### Dependency updates creating too many issues
- Adjust the schedule in `dependency-updates.yml`
- Modify the issue creation logic to batch updates

## Future Workflow Ideas

- **Automated Backtest**: Run backtests on schedule and report results
- **Performance Monitoring**: Track strategy metrics over time
- **Deployment**: Auto-deploy to production after tests pass
- **Changelog Generator**: Auto-generate changelog from commits

---

**Last Updated**: January 20, 2026
