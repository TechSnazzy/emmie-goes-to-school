# Astra checkpoint — September 5, 2026

## User request and pause

Sean wants to make this game wonderful for his seven-year-old daughter Emmie, then push it live on GitHub Pages. Preserve the family story, click/tap movement, and no-failure spirit. Sean explicitly requested a pause because his token allowance was almost exhausted. This branch is a work-in-progress checkpoint, **not a deployed release**. Resume here when he asks; finish polish and verification before merging to `main` and publishing (publication was already authorized, subject to resuming this paused task).

- Canonical local project: `/home/sean/Projects/emmie-goes-to-school`
- GitHub: https://github.com/TechSnazzy/emmie-goes-to-school
- Live game: https://techsnazzy.github.io/emmie-goes-to-school/
- Website: https://seantechguy.com; local website repo `/home/sean/Projects/seantechguy-site` maps to `TechSnazzy/TechSnazzy`. Its Games menu already links this game's URL.
- Sean keeps development projects in `~/Projects`.

## Recovery and branches

- Original production commit: `4295c9d6845a0c482a91c1acb2e25cc4c91cbdaf` (v0.2.0).
- Annotated backup tag **`before-astra-2026-09-05`** is already pushed to GitHub.
- Checkpoint branch: **`astra/wonderful-morning`**.
- `main` and live GitHub Pages stay on the original version during the pause. Pages uses the `main` branch, root directory, legacy build.
- Development was done in `/home/sean/Work/emmie-recovery` because the session's writable roots excluded Projects. The checkpoint is transferred back to the canonical Projects repo; do not depend on temporary files surviving.
- An old configured Git credential helper points to an uninstalled `gh` version. Push works with `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push ...`. Avoid changing global configuration unnecessarily.
- To undo the eventual single-release commit, use `git revert <release-commit>` and push `main`. For an exact original tree later, make a normal restore commit from the backup tag after checking for user edits. Do not force-push or hard-reset user work.

## Implemented

- New responsive storybook title screen: cream/lilac palette, crisp DOM typography, animated floating 3D island, rainbow, pastel trees, school, waving Emmie, family and Milo.
- Three backpack colors, matching hair bow and cubby backpack; choice persisted on the device.
- Eight discovery stickers across all chapters; tap floating golden stars or walk near them. Driving earns the road-trip sticker. Saved sticker book with hints and a per-run collection.
- Butterflies, flowers, swimming duck family, room stars, teddy and books, school bunting, roadside rainbow, particle trails and task-completion bursts.
- Pet Milo or the puppies by tapping them: hearts, sounds, tail wags and a friendly message.
- Chapter-based progress instead of a time-pressure meter. Everyone earns Ready/Kind/Brave stars and a personal welcome at the end; friends make room in line regardless of speed. Original speed-record storage remains untouched.
- New side panel, journey indicator, next-job walking assistance, optional speech-synthesis directions, sticker-book pause and explicit pause/resume, visibility-change pause.
- Early Play clicks during the opening fade are handled. Narrated checklist tasks now check off. Keyboard handling lets native buttons work. Camera resizes when the layout changes.
- Flowers use instancing to reduce draw calls. Shared model materials persist across scenes; removed traffic geometry is disposed.
- Source version bumped to `0.3.0` (currently available in body data-version/title tooltip).

## Verified so far

- Full Chromium browser journey **passed** after final feature additions: bedroom → leave → drive → park → fence → hallway → racks → line → end.
- All **8 of 8 stickers** collected; no page errors; mint backpack selected and retained on reload; album retained on reload; completed-visit count 1; opening album freezes elapsed simulation and closing resumes.
- The journey uses real button/canvas clicks plus accelerated calls to the actual scene update functions, including normal movement/pathfinding/collision. It does not teleport Emmie or force objectives. Earlier real-time play got as far as the gate before temporary browser/server sessions ended.
- Responsive screenshot pass completed at 390×844 (title and park), 820×1180 portrait tablet, 844×390 landscape, and 1440×900 park. No body horizontal overflow. The second batch of corrected screenshots was captured but **still needs visual inspection**.
- `git diff --check` and selected JS syntax checks passed before checkpoint.

## Next steps on resume

1. Read this file, check branch/worktree/remotes, preserve any intervening user edits. Inspect current game in a browser. Do not redo implemented work.
2. Inspect corrected responsive screenshots and final celebration visually; check short-phone heights, portrait-tablet title framing, end screen fit and actual canvas target taps. Earlier tablet clipping and landscape Play cutoff were patched; latest captures need review.
3. Targeted tests still worthwhile: new pet interactions, speech toggle/browser support (actual voice depends on device), Escape pause/resume, keyboard navigation, touch input, resize during gameplay, no-collection completion, replay/reset (album persists, run count resets), malformed/blocked localStorage. No need to rerun a giant suite without new changes or concerns.
4. Check that rainbow/bunting decorations look intentional in gameplay, mobile frame rate is reasonable, and tiny helper text is legible. Consider fixing the existing raw JavaScript error overlay into a friendly failure message; not yet implemented.
5. Update README: it still describes the **old speed-based rewards** and old UI. Document new features, controls, saved data, tests and rollback. Clean any remaining stale comments/unused imports and make version discoverable if useful.
6. Commit polished release, merge the checkpoint branch into `main` safely, push to GitHub, verify Pages build and live resources/game startup. Existing website menu does not need changing. User already authorized publication of the completed game.
7. Final handoff: live play link, concise changes and test result, exact original backup tag and rollback instructions. Do not claim deployment until verified.

## Running and testing

No build step or runtime package install: Three.js is vendored; all art is generated as 3D code. Start `python3 -m http.server 8000 --bind 127.0.0.1` at the repo root.

Browser tests are `tests/journey.mjs` and `tests/layouts.mjs`. They require Playwright and a Chromium executable. Default executable is `/usr/bin/chromium`; override with `CHROMIUM_PATH`. Import normally from installed `playwright`, or set `PLAYWRIGHT_MODULE` to a module path.

This machine's already installed Playwright was `/home/sean/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs` (1.62.1). Example:

```sh
PLAYWRIGHT_MODULE=/home/sean/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs node tests/journey.mjs
PLAYWRIGHT_MODULE=/home/sean/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs node tests/layouts.mjs
```

Tests write screenshots to `/tmp/emmie-*.png`. Prior screenshots may still exist: `emmie-after.png` (desktop title before final flower distribution), `emmie-end.png`, `emmie-album.png`, `emmie-mobile.png`, `emmie-tablet.png`, `emmie-landscape.png`, `emmie-mobile-play.png`, `emmie-park.png`, and `emmie-run-<scene>.png`. Regenerate if absent. Headless Chromium uses SwiftShader, so test rendering performance is not representative of a hardware-accelerated tablet. Local server/browser execution and writing Projects required tool sandbox escalation in this session.
