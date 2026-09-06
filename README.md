# Emmie Goes to School 🎒

A gentle little game for a 7-year-old. It's morning — help Emmie wake up, get
ready, and walk to class. **Click where she should go** and she walks there by
herself, around the furniture. A yellow ring shows the next job — get her to it
and she does the rest. No keys to hold.

**You can't lose.** Take your time, explore, and help along the way. Every
completed morning earns three keepsake stars: **Ready, Kind, and Brave**.

**▶ Play:** <https://techsnazzy.github.io/emmie-goes-to-school/>

## The Wonderful Morning edition · v0.3.0

Pick a pink, lilac, or mint backpack, then set out from a floating storybook
island. Discover eight golden stars that become stickers in Emmie's keepsake
book. Pet Milo and the puppies, watch the butterflies and swimming ducks, and
arrive at a rainbow celebration with Dad and the class.

Backpack color, collected stickers, completed mornings, and audio preferences
are saved in this browser on this device. Replaying starts a fresh morning but
keeps the sticker book. The game still works when browser storage is unavailable;
choices simply won't be remembered after closing or refreshing it. Progress
within an unfinished morning is not saved.

## The morning, scene by scene

1. **Getting ready** – Mom helps: wake up, turn on the light, get dressed, go
   potty, brush teeth, shoes + coat. Milo the cat comes to say hi.
2. **Out the door** – grab your lunchbox, then get in the white Tesla. Dad drives.
3. **Driving** – click or drag left and right to steer. You can't crash — bumping a car just goes "beep beep".
4. **Through the park** – say hi to the friendly dog, walk to the school gate.
5. **The gate** – it's locked; wait for a grown-up to open it (pet the puppy while you wait).
6. **Down the hall** – walk to Room 3.
7. **Backpack & lunchbox** – hang the backpack on the hook, lunchbox in the bin.
8. **Line up!** – get in line, and the teacher comes out to say good morning.

## Controls

| Action | How |
|--------|-----|
| Walk   | Click or tap where she should go |
| Do a job | Just arrive at the glowing ring |
| Walk (optional) | Arrow keys / `WASD` still work |
| A helping hand | **Walk to my next job** follows the route to the next task |
| Collect a sticker | Tap its floating golden star, or walk close to it |
| Pet Milo or a puppy | Tap the animal for hearts and a happy greeting |
| Sticker book | Open **Sticker book**; the adventure pauses while you look |
| Pause/resume | **Ⅱ**, **Keep exploring**, or `Escape` |
| Read directions | **Read directions to me**, where browser speech is available |
| Music on/off | `M` (or the **♪ music** button) |
| Sounds on/off | `N` (or the **🔊 sounds** button) |

On a phone or tablet, tap where she should go — same thing.
During the drive, drag to steer or let Dad cruise. Arrow keys also control
steering and speed. Switching away from the game pauses the adventure.

## Run it locally

```sh
./install.sh          # serves the folder and opens your browser
# or:  python3 -m http.server 8000   → http://localhost:8000
```

Dev: append `?scene=park` to jump to a scene, `&auto` to autoplay it.

## How it's built

**Isometric low-poly 3D** with Three.js (vendored, no CDN), no build step and
**no model or audio files** — every character and prop is assembled in code from
boxes and low-segment cones, and the music/sound is a small WebAudio synth.
An orthographic camera sits at a true isometric angle (45° yaw, 35.26° pitch)
with a directional sun and soft shadows.

The HUD is plain DOM and lives *outside* the 3D viewport — a top bar and a side
panel — so nothing is ever drawn over the gameplay view.

```
index.html           the HUD shell (top bar, view, side panel, touch controls)
style.css            layout: HUD never overlaps the view
vendor/three.module.js
src/render3d.js      isometric camera, lights, shadows, scene root
src/models.js        the low-poly model library
src/engine.js        input, loop, math, the 2D overlay used by the screens
src/audio.js         the calm morning theme + soft sound effects
src/adventure.js     saved backpack, sticker book, and chapter progress
src/delight.js       butterflies, ducks, flowers, petting, and sparkles
src/presentation.js  title, celebration, dialogs, and spoken directions
src/world.js         movement, collision, A* click-to-walk pathfinding, camera
src/state.js         morning progress, stars, DOM HUD, scene manager
src/router.js        scene registry (keeps scenes decoupled)
src/scenes/          one file per scene (+ _kit.js shared plumbing)
src/main.js          wires it together
```

## Browser checks

Serve the repository on `http://127.0.0.1:8000`, install Playwright for development
(`npm install --no-save --package-lock=false playwright`), and run:

```sh
node tests/journey.mjs
node tests/layouts.mjs
node tests/interactions.mjs
```

Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`. An existing
Playwright installation can be used through `PLAYWRIGHT_MODULE` (absolute path
to its `index.mjs`). Screenshots are written to `/tmp/emmie-*.png`.

The journey checks all eight chapters and stickers using real button and canvas
clicks, accelerating scene updates with the normal walking and collision logic.
The other checks cover responsive layouts, keyboard and touch, pause, petting,
replay, storage failures, and speech requests. Actual voice quality and tablet
performance depend on the device; headless checks do not verify those.

## Original version and rollback

The original v0.2.0 is preserved by the Git tag **`before-astra-2026-09-05`**.
To inspect it without changing this checkout:

```sh
git worktree add ../emmie-original before-astra-2026-09-05
```

The v0.3.0 release is one merge into `main`. To undo it, find its merge commit
with `git log --merges --oneline`, run `git revert -m 1 <merge-commit>`, and push
`main`. That creates a normal rollback commit and preserves history. GitHub
Pages publishes the root of `main`; no build step is required.

## Credits

Made by Sean Morrison for Emmie, who asked for it. Milo is our black cat.
MIT licensed.
