# Parallels X — Sonic Battle Theme Integration Guide

## What You're Getting

Three files to drop into your project:

| File | Purpose |
|------|---------|
| `sonic-battle-theme.css` | Complete UI overhaul — menus, HUD, buttons, panels, character select |
| `sonic-battle-dialogue.css` | Sonic Battle-style dialogue boxes with tails, speaker tags, portraits |
| `sonic-battle-dialogue.js` | Dialogue system with typewriter text, choices, and input handling |

---

## Step 1: Add the Theme CSS

In your `index.html`, add this line **after** all your existing `<link rel="stylesheet">` tags:

```html
<link rel="stylesheet" href="css/sonic-battle-theme.css">
```

The theme uses CSS custom properties and higher-specificity selectors to override your existing styles without modifying them. If you ever want to revert, just remove this one line.

### What changes visually:
- **Background**: Bright blue gradient (Sonic Battle's energetic arcade look)
- **Menus**: White panels with thick black borders, angular clip-path cuts
- **Buttons**: Rectangular with 3D drop shadows, yellow hover states
- **Character cards**: White with thick black borders, red/yellow selection states
- **HUD**: Cleaner bars with white borders instead of rounded gradients
- **Text**: Uses "Chakra Petch" font (falls back to system sans-serif if offline)

---

## Step 2: Add the Dialogue System

### A. Add the CSS

In `index.html`, add after the theme CSS:

```html
<link rel="stylesheet" href="css/sonic-battle-dialogue.css">
```

### B. Add the JS module

In any file where you need dialogue (e.g., `story.js`, `main.js`), import:

```js
import { SonicBattleDialogue } from './sonic-battle-dialogue.js';
```

### C. Basic usage — single message

```js
const dia = new SonicBattleDialogue();
dia.show({
  speaker: 'Rrvvfo',
  speakerClass: 'p1',      // p1=red, p2=blue, neutral=gray, rival=yellow
  text: "You think you can take me? I've been training for this moment!",
  tail: 'down',            // down, up, left, right
  portrait: 'assets/portraits/rrvvfo.png'
});
```

### D. Full conversation queue

```js
const dialogue = new SonicBattleDialogue({
  typeSpeed: 24,           // ms per character (lower = faster)
  onComplete: () => {
    console.log('All lines finished');
    // Resume gameplay, start match, etc.
  },
  onChoice: ({ choice }) => {
    console.log('Player chose:', choice.value);
  }
});

dialogue.show([
  {
    speaker: 'Rrvvfo',
    speakerClass: 'p1',
    text: "The Lost Year... that's what they call it.",
    tail: 'down',
    portrait: 'assets/portraits/rrvvfo.png'
  },
  {
    speaker: 'Revvfo',
    speakerClass: 'p2',
    text: "But we know the truth. We were there.",
    tail: 'down',
    portrait: 'assets/portraits/revvfo.png'
  },
  {
    speaker: 'Narrator',
    speakerClass: 'neutral',
    text: "Choose your path:",
    choices: [
      { text: "Follow Rrvvfo's story", value: 'rrvvfo_route' },
      { text: "Follow Revvfo's story", value: 'revvfo_route' },
      { text: "Skip the intro", value: 'skip' }
    ]
  }
]);
```

### E. Controls

| Input | Action |
|-------|--------|
| Enter / Space / Z / J / F | Advance dialogue or confirm choice |
| Arrow Keys | Navigate choices |
| Escape | Skip/close dialogue |

---

## Step 3: Specific Cosmetic Fixes Included

### Fixed: Menu readability
- Higher contrast text (black on white instead of gray on dark)
- Larger, bolder font weights
- Clear visual hierarchy with uppercase labels

### Fixed: Button feedback
- 3D press effect (shadow shrinks on active)
- Bright yellow hover state
- Angular clip-path shapes for energy

### Fixed: Character select clarity
- Thick black borders on all cards
- Red outline for P1, blue for P2
- Yellow fill on hover/selection
- No more subtle gradients that blend together

### Fixed: HUD visibility
- White borders on health/energy/guard bars
- Flat color fills instead of complex gradients
- Stronger text shadows for readability over gameplay

### Fixed: Modal consistency
- All modals (pause, settings, results, confirm) share the same white-panel style
- Unified border thickness and shadow depth

---

## Step 4: Optional Customizations

### Change the blue background

In `sonic-battle-theme.css`, edit the `--sb-blue` and `--sb-blue-dark` variables:

```css
:root{
  --sb-blue: #0066cc;      /* Main background color */
  --sb-blue-dark: #003388; /* Background gradient end */
}
```

### Use a different font

The theme imports "Chakra Petch" from Google Fonts. To use a different font:

1. Replace the `@import` URL at the top of both CSS files
2. Update `--sb-font` and `--sb-dia-font` variables

Recommended alternatives for the Sonic Battle look:
- `Rajdhani` (more angular)
- `Orbitron` (sci-fi)
- `Press Start 2P` (true pixel font — use sparingly, only for headers)

### Add character portraits

The dialogue system supports portraits. Create a folder:

```
assets/
  portraits/
    rrvvfo.png
    revvfo.png
    wade.png
    bark.png
    ...etc
```

Recommended size: **96×96px** (or 64×64 for mobile). Use transparent PNGs.

### Adjust typewriter speed

```js
const dialogue = new SonicBattleDialogue({
  typeSpeed: 16   // Fast (default is 28)
});
```

---

## Step 5: Integration with Your Story System

If your `story.js` or `lost-year-story.js` currently uses the `#msg` element or custom text rendering, replace it with the dialogue system:

**Before (approximate):**
```js
function showStoryText(text) {
  const msg = document.getElementById('msg');
  msg.querySelector('p').textContent = text;
  msg.classList.remove('hidden');
}
```

**After:**
```js
import { SonicBattleDialogue } from './sonic-battle-dialogue.js';

const storyDialogue = new SonicBattleDialogue({
  onComplete: () => {
    // Resume story ladder, start next match, etc.
    advanceStoryNode();
  }
});

function showStoryText(entry) {
  storyDialogue.show(entry);
}
```

---

## File Structure After Integration

```
Parallel-X-Fighting/
├── index.html                    ← Add 2 <link> tags
├── css/
│   ├── game.css                  ← unchanged
│   ├── combat.css                ← unchanged
│   ├── qol.css                   ← unchanged
│   ├── sonic-battle-theme.css    ← NEW (override layer)
│   └── sonic-battle-dialogue.css ← NEW
├── js/
│   ├── main.js                   ← unchanged
│   ├── story.js                  ← import dialogue here
│   ├── sonic-battle-dialogue.js  ← NEW
│   └── ...
└── assets/
    └── portraits/                ← NEW (optional)
        ├── rrvvfo.png
        └── ...
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Theme not applying | Make sure `sonic-battle-theme.css` is linked **after** all other CSS files |
| Font not loading | The theme falls back to `Segoe UI, Arial, sans-serif`. Check internet for Google Fonts, or self-host the font |
| Dialogue box not appearing | Check browser console for module import errors. Ensure `sonic-battle-dialogue.js` is in the same folder as the importing file |
| Mobile looks off | Both CSS files have `@media` breakpoints. Test at 760px and 460px widths |
| Old dark theme still visible | The theme overrides most selectors, but if you have inline styles (`style="..."`) in HTML, those take precedence. Move them to classes |

---

## Credits / Notes

- The Sonic Battle reference is the GBA title (2003)
- Theme uses CSS `clip-path` for angular shapes — supported in all modern browsers
- The dialogue system is dependency-free and self-contained
- All existing game logic (combat, input, saves) is untouched — this is purely presentation

---

**Questions?** Check the inline comments in each file — they're heavily documented.
