# Publishing Checklist for @openclawchain/swap-cli

## Pre-Publishing Steps

### 1. Update Repository URL (if needed)

In `package.json`, update the repository URL to match your actual GitHub repository:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR-ORG/occ-swap-cli.git"
}
```

### 2. Verify Package Name Availability

Check if the package name is available on npm:

```bash
npm search @openclawchain/swap-cli
```

If taken, choose a different name in `package.json`.

### 3. Create npm Account (if needed)

```bash
npm login
```

Or create account at: https://www.npmjs.com/signup

### 4. Create Organization (if needed)

For scoped packages like `@openclawchain/swap-cli`, you need an npm organization:

1. Go to https://www.npmjs.com/org/create
2. Create organization named `openclawchain`
3. Or use your personal scope: `@yourusername/swap-cli`

### 5. Build and Test Locally

```bash
# Install dependencies
npm install

# Build
npm run build

# Test locally
npm link
occ-swap --version
occ-swap swap tokens --blockchain near

# Unlink after testing
npm unlink -g @openclawchain/swap-cli
```

### 6. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included in the package.

### 7. Test Installation from Tarball

```bash
# Create tarball
npm pack

# Install from tarball
npm install -g openclawchain-swap-cli-1.0.0.tgz

# Test
occ-swap --version

# Uninstall
npm uninstall -g @openclawchain/swap-cli
```

## Publishing

### First Time Publishing

```bash
# Build
npm run build

# Publish (for scoped packages, use --access public)
npm publish --access public
```

### Subsequent Releases

1. Update version in `package.json`:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. Publish:
   ```bash
   npm publish --access public
   ```

3. Tag release on GitHub:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

## Post-Publishing

### 1. Verify Package

```bash
# View on npm
npm view @openclawchain/swap-cli

# Install and test
npm install -g @openclawchain/swap-cli
occ-swap --version
```

### 2. Update Documentation

- Add npm badge to README
- Update installation instructions
- Announce on social media/Discord/Telegram

### 3. Create GitHub Release

1. Go to: https://github.com/YOUR-ORG/occ-swap-cli/releases/new
2. Tag: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Description: Changelog and features

## Troubleshooting

### "You do not have permission to publish"

- Make sure you're logged in: `npm whoami`
- For scoped packages, use: `npm publish --access public`
- Verify you own the organization

### "Package name already exists"

- Choose a different name in `package.json`
- Or use your personal scope: `@yourusername/swap-cli`

### "Version already published"

- Update version: `npm version patch`
- Cannot republish same version

### "Missing files in package"

- Check `files` field in `package.json`
- Check `.npmignore` file
- Use `npm pack --dry-run` to preview

## Version Strategy

- **Patch (1.0.x)** - Bug fixes, documentation updates
- **Minor (1.x.0)** - New features, backward compatible
- **Major (x.0.0)** - Breaking changes

## Quick Reference

```bash
# Login
npm login

# Build
npm run build

# Test package contents
npm pack --dry-run

# Publish
npm publish --access public

# Update version
npm version patch

# View published package
npm view @openclawchain/swap-cli
```

## For Hackathon

If publishing for a hackathon, consider:

1. **Beta version:** Use `1.0.0-beta.1` for pre-release
2. **Quick iterations:** Use patch versions for rapid updates
3. **Documentation:** Ensure README is clear for new users
4. **Examples:** Include working examples in documentation
5. **Support:** Monitor GitHub issues during hackathon

## Security

- Never commit `.env` files
- Keep private keys secure
- Review code before publishing
- Use 2FA on npm account
- Consider npm provenance: `npm publish --provenance`

---

Good luck with your publish! 🚀
