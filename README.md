# Emmie Goes to School 🎒

A gentle little game for a 7-year-old. It's morning — help Emmie wake up, get
ready, and walk to class. Walk around with the arrow keys and press **Z** at the
glowing ring. A yellow arrow always points to the next thing to do.

**You can't lose.** Emmie always makes it to class — a friendly sun fills up as
the morning goes, and finishing quickly earns more stars (★★★).

**▶ Play:** <https://techsnazzy.github.io/emmie-goes-to-school/>

## The morning, scene by scene

1. **Getting ready** – Mom helps: wake up, turn on the light, get dressed, go
   potty, brush teeth, shoes + coat. Milo the cat comes to say hi.
2. **Out the door** – grab your lunchbox, then get in the white Tesla. Dad drives.
3. **Driving** – steer with ◀ ▶. You can't crash — bumping a car just goes "beep beep".
4. **Through the park** – say hi to the friendly dog, walk to the school gate.
5. **The gate** – it's locked; wait for a grown-up to open it (pet the puppy while you wait).
6. **Down the hall** – walk to Room 3.
7. **Backpack & lunchbox** – hang the backpack on the hook, lunchbox in the bin.
8. **Line up!** – get in line, and the teacher comes out to say good morning.

## Controls

| Action | Keys |
|--------|------|
| Walk   | Arrow keys / `WASD` |
| Do it  | `Z` / `Enter` / `Space` |
| Music on/off | `M` (or the **♪ music** button) |
| Sounds on/off | `N` (or the **🔊 sounds** button) |

On a phone or tablet the touch controls appear automatically.

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
src/world.js         movement, collision and camera targeting in game-space
src/state.js         morning progress, stars, DOM HUD, scene manager
src/router.js        scene registry (keeps scenes decoupled)
src/scenes/          one file per scene (+ _kit.js shared plumbing)
src/main.js          wires it together
```

## Credits

Made by Sean Morrison for Emmie, who asked for it. Milo is our black cat.
MIT licensed.
