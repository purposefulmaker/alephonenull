# Publish Checklist — @alephonenull/eval@3.0.0 (experimental tag)

Manual preflight for publishing from `packages/npm`. Run every step; do not
publish on a partial pass. `pnpm --filter` commands run from the `_aleph` repo
root (the workspace whose `pnpm-workspace.yaml` lists `packages/*`), not the
factory root.

## 1. Preconditions

- [ ] Logged in to the right registry account:

  ```bash
  npm whoami
  ```

- [ ] Clean single build from repo root:

  ```bash
  pnpm --filter @alephonenull/eval build
  ```

- [ ] Gates green (run both, record the actual numbers — do not publish on a
      stale or remembered result):

  ```bash
  pnpm --filter @alephonenull/eval test        # full suite, note pass count
  pnpm --filter @alephonenull/eval type-check  # tsc --noEmit, zero errors
  ```

- [ ] Packed contents are correct:

  ```bash
  cd packages/npm && npm pack --dry-run
  ```

  The file list MUST include `DISCLAIMER.md` and `RESEARCH_ONLY.md` (both exist
  in `packages/npm/` and are listed in `package.json` `files`; `README.md`,
  `CHANGELOG.md`, and `LICENSE` should also appear). Expected total is roughly
  ~32 files — confirm the actual count from the dry-run output rather than
  trusting this number.

- [ ] Clean-room tarball smoke test:

  ```bash
  cd packages/npm && npm pack            # produces alephonenull-eval-3.0.0.tgz
  mkdir /tmp/aleph-smoke && cd /tmp/aleph-smoke
  npm init -y
  npm install /path/to/alephonenull-eval-3.0.0.tgz
  node -e "const m=require('@alephonenull/eval'); const v3=require('@alephonenull/eval/v3'); if(v3.unsupportedClaimRisk(0,1)!==0) throw new Error('meter'); console.log('ok', m.VERSION, v3.METER_SPEC_VERSION)"
  ```

  Expect `ok 3.0.0 <meter spec version>` and a zero exit code.

## 2. The publish command

```bash
cd packages/npm && npm publish
```

What is already configured — no extra flags needed:

- `package.json` `publishConfig` sets `"access": "public"` and
  `"tag": "experimental"`. Plain `npm publish` therefore publishes public under
  the `experimental` dist-tag; you do NOT need to pass `--tag experimental`.
- `prepublishOnly` runs `npm run build && npm test && npm run lint`
  automatically on publish. If any of those fail, the publish aborts — that is
  the last gate, not the first; do the preflight above anyway.
- Do NOT use the `release` script for this publish: it runs
  `npm version prerelease` first, which would bump `3.0.0` to a prerelease
  version.

## 3. Post-publish verification

- [ ] Dist-tags are what you expect (`experimental: 3.0.0`; there should be no
      surprise `latest`):

  ```bash
  npm view @alephonenull/eval dist-tags
  ```

- [ ] Install-from-registry smoke (fresh empty dir):

  ```bash
  mkdir /tmp/aleph-reg-smoke && cd /tmp/aleph-reg-smoke
  npm init -y
  npm install @alephonenull/eval@experimental
  node -e "const m=require('@alephonenull/eval'); const v3=require('@alephonenull/eval/v3'); if(v3.unsupportedClaimRisk(0,1)!==0) throw new Error('meter'); console.log('ok', m.VERSION, v3.METER_SPEC_VERSION)"
  ```

- [ ] Remember: published versions are effectively immutable. npm allows
      unpublish only within a limited window and under policy conditions, and a
      version number can never be reused after unpublish. If something is
      wrong, the fix is a new patch version, not a re-publish.

## Do not publish if

- Any gate is red — build, test suite, type-check, lint, or either smoke test.
- The evidence/validation caveats in `README.md` are inconsistent with what the
  package actually claims (the V3 validation status section must still state
  the failed red-team proxy result honestly).
- The version needs bumping (anything already published as `3.0.0` means this
  content requires a new version number).
