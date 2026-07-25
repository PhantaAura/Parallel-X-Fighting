export const CONTROL_MAPS = [
  { l: 'KeyA', r: 'KeyD', j: 'KeyW', b: 'KeyS', a: 'KeyF', h: 'KeyR', x: 'KeyT', s: 'KeyG', u: 'KeyH', d: 'KeyQ', c: 'KeyE', n: 'KeyZ' },
  { l: 'ArrowLeft', r: 'ArrowRight', j: 'ArrowUp', b: 'ArrowDown', a: 'KeyJ', h: 'KeyI', x: 'KeyU', s: 'KeyK', u: 'KeyL', d: 'KeyO', c: 'Semicolon', n: 'KeyN' }
];

export const INPUT_BUFFER_FRAMES = 12;
export const SIMULTANEOUS_WINDOW_FRAMES = 3;
export const SIMPLIFIED_LIGHT_REPEAT_FRAMES = 18;
export const SIMPLIFIED_TOUCH_ACTIONS = Object.freeze(['a']);

const CONTROLLER_ACTIONS = ['j', 'a', 'h', 's', 'd', 'b', 'u', 'k', 'c', 'n'];
const SOURCE_ACTIONS = ['l', 'r', 'up', 'down', 'j', 'b', 'a', 'h', 'x', 's', 'u', 'd', 'k', 't', 'c', 'n'];
const CUSTOMIZABLE_ACTIONS = ['j', 'a', 'h', 's', 'd', 'b', 'u', 'k'];
const ACTION_NAMES = {
  j: 'Jump',
  a: 'Light',
  h: 'Heavy',
  s: 'Special',
  d: 'Dash',
  b: 'Block',
  u: 'Ultimate',
  k: 'Breaker',
  x: 'Launcher',
  t: 'Throw',
  c: 'Counter',
  n: 'Lens'
};

export const CONTROLLER_STYLES = Object.freeze({
  nintendo: {
    name: 'Nintendo',
    buttons: { j: 1, a: 0, h: 2, s: 3, d: 5, b: 4, u: 7, k: 6, c: 10, n: 11 },
    labels: { j: 'A', a: 'B', h: 'Y', s: 'X', d: 'R', b: 'L', u: 'ZR', k: 'ZL', c: 'Left Stick', n: 'Right Stick' }
  },
  xbox: {
    name: 'Xbox',
    buttons: { j: 0, a: 2, h: 3, s: 1, d: 5, b: 4, u: 7, k: 6, c: 10, n: 11 },
    labels: { j: 'A', a: 'X', h: 'Y', s: 'B', d: 'RB', b: 'LB', u: 'RT', k: 'LT', c: 'LS', n: 'RS' }
  },
  playstation: {
    name: 'PlayStation',
    buttons: { j: 0, a: 2, h: 3, s: 1, d: 5, b: 4, u: 7, k: 6, c: 10, n: 11 },
    labels: { j: 'Cross', a: 'Square', h: 'Triangle', s: 'Circle', d: 'R1', b: 'L1', u: 'R2', k: 'L2', c: 'L3', n: 'R3' }
  }
});

export const CONTROLLER_STYLE_IDS = Object.freeze(['nintendo', 'xbox', 'playstation', 'custom']);
export const CUSTOM_CONTROLLER_ACTIONS = Object.freeze([...CUSTOMIZABLE_ACTIONS]);

const TOUCH_LABELS = {
  l: 'Left',
  r: 'Right',
  up: 'Up',
  down: 'Down',
  j: 'Jump',
  b: 'Block',
  a: 'Light',
  h: 'Heavy',
  x: 'Launcher',
  s: 'Special',
  u: 'Ultimate',
  d: 'Dash',
  k: 'Breaker',
  t: 'Throw',
  c: 'Counter',
  n: 'Lens'
};

function buttonLabel(index) {
  return `Button ${Number(index) + 1}`;
}

export function createCustomControllerMapping(base = CONTROLLER_STYLES.xbox) {
  const buttons = { ...base.buttons };
  const labels = {};
  for (const [action, index] of Object.entries(buttons)) labels[action] = buttonLabel(index);
  return { name: 'Custom', buttons, labels };
}

export function canSimplifyTouchAction(action) {
  return SIMPLIFIED_TOUCH_ACTIONS.includes(action);
}

export function formatComboPrompt(style = 'xbox', customMapping = null) {
  if (style === 'touch') return 'Light, Light, Launcher, Jump, Air Light, Air Heavy';
  if (style === 'keyboard') return 'F, F, T, W, F, R';
  const mapping = style === 'custom' ? customMapping || createCustomControllerMapping() : CONTROLLER_STYLES[style] || CONTROLLER_STYLES.xbox;
  return `${mapping.labels.a}, ${mapping.labels.a}, Up + ${mapping.labels.h}, ${mapping.labels.j}, ${mapping.labels.a}, ${mapping.labels.h}`;
}

function emptySides(factory = () => ({})) {
  return [factory(), factory()];
}

function pressedButton(pad, index) {
  return !!pad?.buttons?.[index]?.pressed;
}

function displayKey(code) {
  if (code.startsWith('Key')) return code.slice(3);
  return {
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    Semicolon: ';',
    Space: 'Space'
  }[code] || code;
}

export class InputManager {
  constructor(getGamepads = () => navigator.getGamepads?.() || []) {
    this.getGamepads = getGamepads;
    this.controllerStyles = ['xbox', 'xbox'];
    this.controllerAssignments = [null, null];
    this.customMappings = emptySides(() => createCustomControllerMapping());
    this.simplifiedTouch = [false, false];
    this.lastInputDevice = ['keyboard', 'keyboard'];
    this.keyboard = {};
    this.touch = {};
    this.touchActions = emptySides();
    this.touchActionQueued = emptySides();
    this.current = {};
    this.pressed = {};
    this.previous = {};
    this.queued = {};
    this.frame = 0;
    this.actionDown = emptySides();
    this.actionBuffers = emptySides(() => new Map());
    this.bufferDevices = emptySides(() => new Map());
    this.attackCandidates = emptySides(() => ({ a: null, h: null }));
    this.sourcePrevious = {
      keyboard: emptySides(),
      touch: emptySides(),
      controller: emptySides()
    };
    this.simpleLight = emptySides(() => ({ held: false, count: 0, next: 0 }));
  }

  setKeyboard(code, down) {
    if (down && !this.keyboard[code]) this.queued[code] = true;
    this.keyboard[code] = !!down;
  }

  setTouch(code, down) {
    if (down && !this.touch[code]) this.queued[code] = true;
    this.touch[code] = !!down;
  }

  setTouchAction(side, action, down) {
    const index = side - 1;
    if (down && !this.touchActions[index][action]) {
      this.touchActionQueued[index][action] = true;
      if ((action === 'a' || action === 'h') && this.touchActions[index][action === 'a' ? 'h' : 'a']) {
        this.touchActionQueued[index].a = false;
        this.touchActionQueued[index].h = false;
        this.touchActionQueued[index].t = true;
      }
    }
    this.touchActions[index][action] = !!down;
  }

  setControllerStyle(side, style) {
    if (!CONTROLLER_STYLE_IDS.includes(style)) return false;
    this.controllerStyles[side - 1] = style;
    this.lastInputDevice[side - 1] = 'controller';
    this.clearBuffers();
    return true;
  }

  getControllerStyle(side) {
    return this.controllerStyles[side - 1];
  }

  setControllerAssignment(side,gamepadIndex){
    const resolved=gamepadIndex===null||gamepadIndex==='auto'?null:Number(gamepadIndex);
    if(resolved!==null&&(!Number.isInteger(resolved)||resolved<0))return false;
    this.controllerAssignments[side-1]=resolved;this.clearBuffers();return true;
  }

  getControllerAssignment(side){return this.controllerAssignments[side-1]}

  setCustomButton(side, action, buttonIndex) {
    if (!CUSTOMIZABLE_ACTIONS.includes(action) || !Number.isInteger(Number(buttonIndex))) return false;
    const mapping = this.customMappings[side - 1];
    mapping.buttons[action] = Number(buttonIndex);
    mapping.labels[action] = buttonLabel(buttonIndex);
    this.clearBuffers();
    return true;
  }

  getCustomMapping(side) {
    const mapping = this.customMappings[side - 1];
    return { name: mapping.name, buttons: { ...mapping.buttons }, labels: { ...mapping.labels } };
  }

  setSimplifiedTouch(side, enabled) {
    this.simplifiedTouch[side - 1] = !!enabled;
    this.simpleLight[side - 1] = { held: false, count: 0, next: 0 };
  }

  controllerMapping(side) {
    const index = side - 1;
    const style = this.controllerStyles[index];
    return style === 'custom' ? this.customMappings[index] : CONTROLLER_STYLES[style] || CONTROLLER_STYLES.xbox;
  }

  _keyboardState(side) {
    const map = CONTROL_MAPS[side - 1];
    const state = {};
    for (const [action, code] of Object.entries(map)) state[action] = !!(this.keyboard[code] || this.touch[code]);
    if (side === 1) state.j ||= !!(this.keyboard.Space || this.touch.Space);
    return state;
  }

  _queuedKeyboardActions(side) {
    const map = CONTROL_MAPS[side - 1];
    const queued = {};
    for (const [action, code] of Object.entries(map)) queued[action] = !!this.queued[code];
    if (side === 1) queued.j ||= !!this.queued.Space;
    return queued;
  }

  _controllerState(side, pad) {
    const mapping = this.controllerMapping(side);
    const state = {};
    const horizontal = Number(pad?.axes?.[0] || 0);
    const vertical = Number(pad?.axes?.[1] || 0);
    state.l = horizontal < -0.35 || pressedButton(pad, 14);
    state.r = horizontal > 0.35 || pressedButton(pad, 15);
    for (const action of CONTROLLER_ACTIONS) state[action] = pressedButton(pad, mapping.buttons[action]);
    return {
      state,
      up: vertical < -0.35 || pressedButton(pad, 12)
    };
  }

  _queueAction(side, action, device) {
    const index = side - 1;
    this.actionBuffers[index].set(action, this.frame + INPUT_BUFFER_FRAMES);
    this.bufferDevices[index].set(action, device);
    this.lastInputDevice[index] = device;
  }

  _clearAttackCandidates(side) {
    const index = side - 1;
    this.attackCandidates[index].a = null;
    this.attackCandidates[index].h = null;
    for (const action of ['a', 'h', 't']) {
      this.actionBuffers[index].delete(action);
      this.bufferDevices[index].delete(action);
    }
  }

  _processActionEdge(side, action, device, options = {}) {
    const index = side - 1;
    this.lastInputDevice[index] = device;

    if (action === 'up' || action === 'down' || action === 'l' || action === 'r' || action === 'b') return;

    if (action === 't') {
      this._clearAttackCandidates(side);
      this._queueAction(side, 't', device);
      return;
    }

    if (action === 'h' && options.up) {
      this._clearAttackCandidates(side);
      this._queueAction(side, 'x', device);
      return;
    }

    if (action === 's' && options.block && device === 'keyboard') {
      this._queueAction(side, 'k', device);
      return;
    }

    if (action === 'a' || action === 'h') {
      if (!options.allowChord) {
        this._queueAction(side, action, device);
        return;
      }
      const other = action === 'a' ? 'h' : 'a';
      const otherCandidate = this.attackCandidates[index][other];
      const bothHeld = this.actionDown[index][action] && this.actionDown[index][other];
      if (otherCandidate && this.frame - otherCandidate.frame <= SIMULTANEOUS_WINDOW_FRAMES && bothHeld) {
        this._clearAttackCandidates(side);
        this._queueAction(side, 't', device);
        return;
      }
      this.attackCandidates[index][action] = { frame: this.frame, device };
      return;
    }

    this._queueAction(side, action, device);
  }

  _releaseExpiredCandidates(side) {
    const index = side - 1;
    for (const action of ['a', 'h']) {
      const candidate = this.attackCandidates[index][action];
      if (candidate && this.frame - candidate.frame >= SIMULTANEOUS_WINDOW_FRAMES) {
        this.attackCandidates[index][action] = null;
        this._queueAction(side, action, candidate.device);
      }
    }
  }

  _updateSimplifiedLight(side, touchState, allowChord) {
    const index = side - 1;
    const tracker = this.simpleLight[index];
    if (!touchState.a) {
      tracker.held = false;
      tracker.count = 0;
      tracker.next = 0;
      return;
    }
    if (!tracker.held) {
      tracker.held = true;
      tracker.count = 1;
      tracker.next = this.frame + SIMPLIFIED_LIGHT_REPEAT_FRAMES;
      return;
    }
    if (!this.simplifiedTouch[index] || tracker.count >= 3 || this.frame < tracker.next) return;
    tracker.count++;
    tracker.next = this.frame + SIMPLIFIED_LIGHT_REPEAT_FRAMES;
    this._processActionEdge(side, 'a', 'touch', { allowChord });
  }

  poll(options = {}) {
    const allowChord = options.clash !== true;
    this.frame++;

    for (let index = 0; index < 2; index++) {
      for (const [action, expires] of this.actionBuffers[index]) {
        if (expires < this.frame) {
          this.actionBuffers[index].delete(action);
          this.bufferDevices[index].delete(action);
        }
      }
    }

    const rawCodes = new Set([...Object.keys(this.keyboard), ...Object.keys(this.touch), ...Object.keys(this.previous), ...Object.keys(this.queued)]);
    this.current = {};
    this.pressed = {};
    for (const code of rawCodes) {
      const down = !!(this.keyboard[code] || this.touch[code]);
      this.current[code] = down;
      if (this.queued[code] || (down && !this.previous[code])) this.pressed[code] = true;
    }

    const pads = [...(this.getGamepads() || [])];
    const sourceData = emptySides(() => ({}));

    for (let side = 1; side <= 2; side++) {
      const index = side - 1;
      const keyboardState = this._keyboardState(side);
      const keyboardQueued = this._queuedKeyboardActions(side);
      const touchState = { ...this.touchActions[index] };
      const touchQueued = { ...this.touchActionQueued[index] };
      const assigned=this.controllerAssignments[index];
      const controller = this._controllerState(side, pads[assigned===null?index:assigned]);

      sourceData[index] = {
        keyboard: { state: keyboardState, queued: keyboardQueued, up: false },
        touch: { state: touchState, queued: touchQueued, up: !!touchState.up },
        controller: { state: controller.state, queued: {}, up: controller.up }
      };

      const combined = {};
      for (const action of SOURCE_ACTIONS) {
        combined[action] = !!(keyboardState[action] || touchState[action] || controller.state[action]);
      }
      this.actionDown[index] = combined;
    }

    for (let side = 1; side <= 2; side++) {
      const index = side - 1;
      for (const device of ['keyboard', 'touch', 'controller']) {
        const data = sourceData[index][device];
        const previous = this.sourcePrevious[device][index];
        for (const action of SOURCE_ACTIONS) {
          const edge = !!data.queued[action] || (!!data.state[action] && !previous[action]);
          if (edge) {
            this._processActionEdge(side, action, device, {
              allowChord,
              up: data.up,
              block: !!data.state.b
            });
          }
        }
        this.sourcePrevious[device][index] = { ...data.state };
      }
      this._updateSimplifiedLight(side, sourceData[index].touch.state, allowChord);
      this._releaseExpiredCandidates(side);
    }

    this.previous = { ...this.current };
    this.queued = {};
    this.touchActionQueued = emptySides();
  }

  down(code) {
    return !!this.current[code];
  }

  consume(code) {
    if (!this.pressed[code]) return false;
    delete this.pressed[code];
    return true;
  }

  actionIsDown(side, action) {
    return !!this.actionDown[side - 1][action];
  }

  consumeAction(side, action) {
    const index = side - 1;
    const expires = this.actionBuffers[index].get(action);
    if (expires === undefined || expires < this.frame) return false;
    this.actionBuffers[index].delete(action);
    this.bufferDevices[index].delete(action);
    return true;
  }

  actionLabel(side, action, options = {}) {
    const index = side - 1;
    const device = options.device || this.bufferDevices[index].get(action) || this.lastInputDevice[index];
    if (device === 'touch') return options.air && (action === 'a' || action === 'h') ? `Air ${TOUCH_LABELS[action]}` : TOUCH_LABELS[action] || ACTION_NAMES[action] || action;
    if (device === 'controller') {
      const mapping = this.controllerMapping(side);
      if (action === 'x') return `Up + ${mapping.labels.h}`;
      if (action === 't') return `${mapping.labels.a} + ${mapping.labels.h}`;
      const label = mapping.labels[action] || ACTION_NAMES[action] || action;
      return options.air && (action === 'a' || action === 'h') ? `Air ${label}` : label;
    }
    const map = CONTROL_MAPS[index];
    if (action === 't') return `${displayKey(map.a)} + ${displayKey(map.h)}`;
    if (action === 'k') return `${displayKey(map.b)} + ${displayKey(map.s)}`;
    const label = displayKey(map[action] || action);
    return options.air && (action === 'a' || action === 'h') ? `Air ${label}` : label;
  }

  comboPrompt(side, device = this.lastInputDevice[side - 1]) {
    if (device === 'touch') return formatComboPrompt('touch');
    if (device === 'keyboard') return formatComboPrompt('keyboard');
    const style = this.controllerStyles[side - 1];
    return formatComboPrompt(style, this.customMappings[side - 1]);
  }

  inputStyleName(side, device = this.lastInputDevice[side - 1]) {
    if (device === 'touch') return 'Touch';
    if (device === 'keyboard') return 'Keyboard';
    return this.controllerMapping(side).name;
  }

  suppress(map) {
    for (const key of Object.values(map)) {
      this.current[key] = false;
      delete this.pressed[key];
    }
  }

  clearBuffers() {
    for (let index = 0; index < 2; index++) {
      this.actionBuffers[index].clear();
      this.bufferDevices[index].clear();
      this.attackCandidates[index] = { a: null, h: null };
    }
    this.pressed = {};
    this.queued = {};
    this.touchActionQueued = emptySides();
  }

  clear() {
    this.keyboard = {};
    this.touch = {};
    this.touchActions = emptySides();
    this.current = {};
    this.pressed = {};
    this.previous = {};
    this.queued = {};
    this.actionDown = emptySides();
    this.sourcePrevious = {
      keyboard: emptySides(),
      touch: emptySides(),
      controller: emptySides()
    };
    this.simpleLight = emptySides(() => ({ held: false, count: 0, next: 0 }));
    this.clearBuffers();
  }
}
