# Emmie Goes to School 🎒

A tiny retro-arcade game: it's **6:50 AM** and Emmie the 7-year-old has to be
lined up outside her classroom by **7:50** or she's late. Wake up, get ready,
survive the drive, cross the park, wait for the gate, weave through the hallway,
sort the backpack and lunchbox, and slide into line before the bell.

Play it in any modern browser — no install, no build step.

**▶ Play:** <https://techsnazzy.github.io/emmie-goes-to-school/>

## The morning

| Time  | What happens                                        |
|-------|-----------------------------------------------------|
| 6:50  | Alarm. Mom turns on the light, Milo the cat says hi |
| 7:20  | Out the door to the white Tesla                     |
| 7:30  | Pull up by the community park                       |
| 7:35  | A staff member unlocks the school gate              |
| 7:47  | First bell — line up!                               |
| 7:50  | Class starts. **Be in line.**                       |

## Scenes

1. **Bedroom** – arrows to move, hold `Z` at each spot: lights, dressed, potty, teeth, shoes + hoodie. Milo keeps getting underfoot.
2. **Out the door** – grab the backpack *and* lunchbox, then `Z` to get in the car.
3. **Drive** – `←/→` to change lanes and dodge morning traffic (a bump costs time).
4. **Park** – Emmie auto-runs: `↑`/`Space` to **jump** puddles, dogs and scooters, `↓` to **duck** frisbees and branches.
5. **The gate** – it's locked until 7:35. Tap `→` to keep Emmie from wandering off to play.
6. **Hallway** – top-down weave past the crowd, the supply cart and the wet floor.
7. **Racks** – hold `Z`: backpack on the hook → take out the lunchbox → lunchbox in the bin.
8. **Line up** – final dash. Reach the line before 7:50 and the teacher comes out to say good morning.

Make it with minutes to spare for a 3-star morning. Best time is saved in your browser.

## Controls

| Action | Keys |
|--------|------|
| Move   | Arrow keys / `WASD` |
| Jump   | `↑` / `Space` |
| Action / confirm | `Z` / `Enter` |
| Mute   | `M` |

Touch controls appear automatically on phones and tablets.

## Run it locally

```sh
./install.sh          # serves the folder and opens your browser
# or just:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## How it's built

Plain HTML + ES modules + `<canvas>`. Everything is drawn from rectangles, so
there are no image or audio assets — sound is a small WebAudio bleeper. Internal
resolution is a fixed 480×270, nearest-neighbour scaled, with a CRT scanline
overlay for the arcade look.

```
index.html          markup + the arcade cabinet frame
style.css            cabinet / CRT styling
src/engine.js        canvas scaling, input, audio, text, game loop
src/sprites.js       all the procedural pixel art
src/state.js         the morning clock, HUD, toasts, scene manager
src/router.js        scene registry (keeps scenes decoupled)
src/scenes/*.js      one file per scene
src/main.js          wires it all together
```

## Credits

Made by Sean Morrison for Emmie, who asked for it. Milo is our black cat.

MIT licensed.
