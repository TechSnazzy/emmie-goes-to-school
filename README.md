# Emmie Goes to School 🎒

A gentle little game for a 7-year-old. It's morning — help Emmie wake up, get
ready, and walk to class. Walk around with the arrow keys and press **Z** at the
glowing spot. A yellow arrow always points to the next thing to do.

**You can't lose.** Emmie always makes it to class — a friendly sun fills up as
the morning goes, and finishing quickly earns more stars (★★★).

**▶ Play:** <https://techsnazzy.github.io/emmie-goes-to-school/>

## The morning, scene by scene

1. **Getting ready** – wake up, turn on the light, get dressed, go potty, brush
   teeth, shoes + hoodie. Milo the cat comes to say hi (walk into him for pets).
2. **Out the door** – grab your lunchbox, then get in the white Tesla.
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

Plain HTML + ES modules + `<canvas>`, no build step and **no image or audio
assets** — every sprite is drawn from shapes, and the music/sound is a small
WebAudio synth. Fixed 640×360 internal resolution, scaled to fill the viewport,
viewed at a 3/4 top-down angle.

```
index.html          markup + the sound buttons + touch controls
style.css            fills-the-viewport layout
src/engine.js        canvas, input, text, loop, math
src/audio.js         the calm morning theme + soft sound effects
src/sprites.js       all the procedural art (people, props, buildings)
src/world.js         3/4 movement, camera, collision, the guidance arrow
src/state.js         morning progress, stars, HUD, scene manager
src/router.js        scene registry (keeps scenes decoupled)
src/scenes/          one file per scene (+ _kit.js shared plumbing)
src/main.js          wires it together
```

## Credits

Made by Sean Morrison for Emmie, who asked for it. Milo is our black cat.
MIT licensed.
