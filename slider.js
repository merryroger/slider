/*** The Slider by Ehwaz Raido (Merry Roger) 2022 ***/
/*** 2022 Jun, 9  v.0.1.3 ***/

class Slider {

  settings = {
    mode: 'switch',
    //mode: 'wipe',
    //mode: 'rollup',
    //mode: 'meltdown',
    //mode: 'fog',
    defaultItem: 0,
    items: [],
    dock: null,
    dockClassName: (x) => { return '' },
    auto: false,
    playDirection: 'right',
    loop: false,
    msSwapDelay: 3000,
    msSwapDuration: 1000,
    controlClass: '',
    wheelClass: '',
    kbSupport: null
  }

  wheels = {
    decr: false,
    incr: false,
    _decr: false,
    _incr: false
  }

  sliderModes = {
    'switch': {
      'getProps': (ort, duration) => {
        return {}
      },
      'move': (props) => { },
      'eot': this._resetTransformProps,
    },
    'wipe': {
      'getProps': (ort, duration) => {
        return (ort.horz) ? {
          '--after-left': ((ort.rightDown) ? '100%' : '-100%'),
          '--after-trf': ((ort.rightDown) ? 'translateX(-100%)' : 'translateX(100%)'),
          '--after-trn': `transform ${duration}ms linear`,
          '--before-left': '0',
          '--before-trf': ((ort.rightDown) ? 'translateX(-100%)' : 'translateX(100%)'),
          '--before-trn': `transform ${duration}ms linear`
        } : {
          '--after-top': ((ort.rightDown) ? '100%' : '-100%'),
          '--after-trf': ((ort.rightDown) ? 'translateY(-100%)' : 'translateY(100%)'),
          '--after-trn': `transform ${duration}ms linear`,
          '--before-top': '0',
          '--before-trf': ((ort.rightDown) ? 'translateY(-100%)' : 'translateY(100%)'),
          '--before-trn': `transform ${duration}ms linear`
        }
      },
      'move': (props) => {
        for (let [prop, value] of Object.entries(props)) {
          this.dock.style.setProperty(prop, value);
        }
      },
      'eot': this._resetTransformProps,
    },
    'rollup': {
      'getProps': (ort, duration) => {
        return (ort.horz) ? {
          '--after-left': ((ort.rightDown) ? '100%' : '-100%'),
          '--after-trf': ((ort.rightDown) ? 'translateX(-100%)' : 'translateX(100%)'),
          '--after-trn': `transform ${duration}ms linear`,
        } : {
          '--after-top': ((ort.rightDown) ? '100%' : '-100%'),
          '--after-trf': ((ort.rightDown) ? 'translateY(-100%)' : 'translateY(100%)'),
          '--after-trn': `transform ${duration}ms linear`,
        }
      },
      'move': (props) => {
        for (let [prop, value] of Object.entries(props)) {
          this.dock.style.setProperty(prop, value);
        }
      },
      'eot': this._resetTransformProps,
    },
    'meltdown': {
      'getProps': (ort, duration) => {
        return {
          '--after-left': '0',
          '--after-top': '0',
          '--before-left': '0',
          '--before-top': '0',
          '--before-zx': '2',
          '--before-opc': '0',
          '--before-trn': `opacity ${duration}ms linear`,
        }
      },
      'move': (props) => {
        for (let [prop, value] of Object.entries(props)) {
          this.dock.style.setProperty(prop, value);
        }
      },
      'eot': this._resetTransformProps,
    },
    'fog': {
      'getProps': (ort, duration) => {
        return {
          '--after-left': '0',
          '--after-top': '0',
          '--after-filter': 'blur(16px)',
          '--before-left': '0',
          '--before-top': '0',
          '--before-zx': '1',
          '--before-opc': '.1',
          '--before-filter': 'blur(10px)',
          '--before-trn': `filter ${duration / 2}ms ease-out, opacity ${duration / 2}ms ease-in`,
        }
      },
      'getPropsStage2': (duration) => {
        return {
          '--before-zx': '-1',
          '--before-vs': 'hidden',
          '--before-filter': 'none',
          '--before-trn': 'none',
          '--after-filter': 'blur(0)',
          '--after-zx': '1',
          '--after-trn': `filter ${duration}ms linear`,
        }
      },
      'move': (props) => {
        for (let [prop, value] of Object.entries(props)) {
          this.dock.style.setProperty(prop, value);
        }
      },
      'eot': this._resetTransformProps,
    }
  };

  constructor(settings) {
    this._init(settings);
    this.dock = null;
    this.currentIdx = (settings.defaultItem === undefined || isNaN(settings.defaultItem)) ? 0 : +settings.defaultItem;
    this.currentSrc = null;
    this.cap = (settings.items === undefined || !typeof (settings.items) == 'object') ? 0 : settings.items.length;
    this.orientation = this._defineOrientation();
    this.controls = [];
    this.cbLabels = null;
    this.whLabels = null;
    this.toh = 0;
  }

  _init(settings) {
    for (let [key, value] of Object.entries(settings)) {
      switch (key) {
        default:
          this.settings[key] = value;
      }
    }
  }

  _setUp() {
    this.dock = document.querySelector(this.settings.dock);

    if (this.currentSrc == null) {
      this.currentSrc = this.dock;
    }

    if (this.controls.length == 0) {
      this.controls = document.querySelectorAll(this.settings.controlClass);
      this.controls[0].checked = true;
    }

    if (this.sliderModes[this.settings.mode] == undefined) {
      this.settings.mode = 'switch';
    }

    this.etf = this._transEndCBF.bind(this);
    document.body.addEventListener('transitionend', this.etf);

    if (this.settings.kbSupport !== null) {
      this._kbSupportSetUp();
    }

    if (!this.settings.auto) {
      document.querySelectorAll(this.settings.wheelClass).forEach(
        (wheel) => {
          wheel.style.display = 'block';
          if (this.whLabels !== null) {
            wheel.closest('label').style.display = 'initial';
          }
        }, this);

      this.wdf = this._wheelDownCBF.bind(this);
      this.dock.addEventListener('pointerdown', this.wdf);

      this.wuf = this._wheelUpCBF.bind(this);
      this.dock.addEventListener('pointerup', this.wuf);
    }

    if (this.toh !== 0) {
      clearTimeout(this.toh);
      this.toh = 0;
    }
  }

  go(startPos = 0, src = null) {
    if (isNaN(startPos)) {
      return;
    }

    startPos = (+startPos < 0) ? (this.cap - 1)
      : (+startPos >= this.cap) ? 0
        : +startPos;

    if (this.dock === null) {
      this._setUp();
    }

    if (startPos != this.currentIdx) {
      this._execTransition(startPos, src, false);
      if (this.settings.mode == 'switch' && this.settings.auto) {
        this._delayAutoSwap(startPos);
      }
    } else if (this.settings.auto) {
      this._delayAutoSwap(startPos);
    }
  }

  _delayAutoSwap(pos) {
    pos = (this.orientation.rightDown) ? (pos + 1) : (pos - 1);
      this._setTimeout(pos);
  }

  _transEndCBF(e) {
    if (e.target.closest(this.settings.dock) == this.dock) {
      if (e.pseudoElement == '::after') {
        this._finishTransition(this.currentIdx);
      } else if (e.pseudoElement == '::before' && e.propertyName == 'filter') {
        let props = this.sliderModes[this.settings.mode].getPropsStage2(this.settings.msSwapDuration);
        this.sliderModes[this.settings.mode].move(props);
      } else if (e.pseudoElement == '::after' && e.propertyName == 'filter') {
        this._finishTransition(this.currentIdx);
      } else if (e.pseudoElement == '::before' && e.propertyName == 'opacity' && this.settings.mode == 'meltdown') {
        this._finishTransition(this.currentIdx);
      }
    }
  }

  _checkEventTarget(e, tgt, match) {
    let target = (tgt !== null && e.target.querySelector(match) == tgt);
    return (e.target.closest(match) !== null || target);
  }

  _wheelDownCBF(e, tgt = null) {
    let pos = this.currentIdx;

    if (this.settings.auto || this.wheels._incr || this.wheels._decr) {
      return;
    }

    if (this._checkEventTarget(e, tgt, '.slider-wheel.incr')) {
      pos++;

      pos = (+pos < 0) ? (this.cap - 1)
        : (+pos >= this.cap) ? 0
          : +pos;

      clearTimeout(this.toh);
      this.toh = 0;
      this.wheels.incr = this.wheels._incr = true;
      this.go(pos, this.controls[pos]);
      this.controls[pos].checked = true;
    } else if (this._checkEventTarget(e, tgt, '.slider-wheel.decr')) {
      pos--;

      pos = (+pos < 0) ? (this.cap - 1)
        : (+pos >= this.cap) ? 0
          : +pos;

      clearTimeout(this.toh);
      this.toh = 0;
      this.wheels.decr = this.wheels._decr = true;
      this.go(pos, this.controls[pos]);
      this.controls[pos].checked = true;
    }
  }

  _wheelUpCBF(e, tgt = null) {
    if (this.settings.auto) {
      return;
    }

    if (this._checkEventTarget(e, tgt, '.slider-wheel.incr')) {
      this.wheels._incr = false;
    } else if (this._checkEventTarget(e, tgt, '.slider-wheel.decr')) {
      this.wheels._decr = false;
    }
  }

  _go(pos = 0) {
    if (this.settings.loop) {
      pos = (+pos < 0) ? (this.cap - 1)
        : (+pos >= this.cap) ? 0
          : +pos;
    } else {
      if (pos >= this.cap)
        return;
    }

    let src = this.controls[pos];
    src.checked = true;

    this._execTransition(pos, src);
    if (this.settings.mode == 'switch') {
      this._finishTransition(pos);
    }
  }

  _execTransition(pos, src, auto = true) {
    let bgI;
    let props = {};
    let ort = Object.assign({}, this.orientation);
    ort.rightDown = (auto) ? this.settings.auto & this.orientation.rightDown
      : pos > this.currentIdx;

    ort.rightDown = (this.wheels.decr || this.wheels.incr) ? this.wheels.incr : ort.rightDown;

    bgI = (this.currentSrc == null) ? `url("${this.settings.items[this.currentIdx]}")` : getComputedStyle(this.currentSrc).backgroundImage;
    this.dock.style.setProperty('--before-bgr', bgI);

    bgI = (src == null) ? `url("${this.settings.items[pos]}")` : getComputedStyle(src).backgroundImage;
    this.dock.style.setProperty('--after-bgr', bgI);

    this._visibilityToggle('before', true);
    this._visibilityToggle('after', true);

    props = this.sliderModes[this.settings.mode].getProps(ort, this.settings.msSwapDuration);
    this.sliderModes[this.settings.mode].move(props);

    this.currentIdx = pos;
    this.currentSrc = src;

    if (this.toh !== 0) {
      clearTimeout(this.toh);
      this.toh = 0;
    }
  }

  _finishTransition(pos) {
    this.dock.className = this.settings.dockClassName(this.currentIdx + 1);
    this.sliderModes[this.settings.mode].eot.bind(this)();

    this._visibilityToggle('before', false);
    this._visibilityToggle('after', false);
    this.dock.style.setProperty('--after-left', '0');
    this.dock.style.setProperty('--before-left', '0');

    this.wheels.incr = this.wheels._incr;
    this.wheels.decr = this.wheels._decr;

    if (this.settings.auto || this.wheels.decr || this.wheels.incr) {
      let rightDown = (this.wheels.decr || this.wheels.incr) ? this.wheels.incr : this.orientation.rightDown;
      pos = (rightDown) ? (pos + 1) : (pos - 1);
      this._setTimeout(pos);
    }

  }

  _visibilityToggle(layerName, onState = true) {
    let visibility = (onState) ? 'visible' : 'hidden';
    let zIndex = (onState) ? '0' : '-1';

    switch (layerName) {
      case 'before':
        this.dock.style.setProperty('--before-vs', visibility);
        this.dock.style.setProperty('--before-zx', zIndex);
        break;
      case 'after':
        this.dock.style.setProperty('--after-vs', visibility);
        this.dock.style.setProperty('--after-zx', zIndex);
        break;
    }
  }

  _setTimeout(pos) {
    if (this.toh == 0) {
      let _go = this._go.bind(this, pos);
      let delay = (this.wheels.decr || this.wheels.incr) ? 100 : this.settings.msSwapDelay;
      this.toh = setTimeout(_go, delay);
    }
  }

  _resetTransformProps() {
    this.dock.style.setProperty('--after-trf', 'none');
    this.dock.style.setProperty('--after-trn', 'none');
    this.dock.style.setProperty('--before-trf', 'none');
    this.dock.style.setProperty('--before-trn', 'none');
    this.dock.style.setProperty('--before-opc', '1');
  }

  _defineOrientation() {
    let orset = { rightDown: true };

    switch (this.settings.playDirection.toLowerCase()) {
      case 'top':
        orset.rightDown = false;
      case 'bottom':
        orset.horz = false;
        break;
      case 'left':
        orset.rightDown = false;
      case 'right':
      default:
        orset.horz = true;
    }

    return orset;
  }

  _kbSupportSetUp() {
    this.cbLabels = document.querySelectorAll(this.settings.kbSupport.controlButtonWrappingLabels);
    this.whLabels = document.querySelectorAll(this.settings.kbSupport.wheelButtonWrappingLabels);

    if (this.cbLabels == null && this.whLabels == null) {
      this.settings.kbSupport = null;
      return false;
    }

    if (this.cbLabels !== null) {
      this.cbLabels.forEach((cbLabel) => {
        cbLabel.addEventListener('keypress', (e) => {
          if (e.charCode == 13 || e.charCode == 32) {
            e.preventDefault();
            let input = e.target.querySelector('input');
            input.checked = true;
            slider.go(+e.target.getAttribute('data-slide'), input);
          }
        })
      });
    }

    if (this.whLabels !== null) {
      this.whLabels.forEach((whLabel) => {
        whLabel.addEventListener('keypress', (e) => {
          if (e.charCode == 32) {
            e.preventDefault();
            let button = e.target.querySelector('button');
            slider._wheelDownCBF(e, button);
          }
        });

        whLabel.addEventListener('keyup', (e) => {
          if (e.keyCode == 32) {
            e.preventDefault();
            let button = e.target.querySelector('button');
            slider._wheelUpCBF(e, button);
          }
        })
      });
    }

    return true;
  }

  destruct() {
    document.body.removeEventListener('transitionend', this.etf);
    this.dock.removeEventListener('pointerdown', this.wdf);
    this.dock.removeEventListener('pointerup', this.wuf);
    this._finishTransition(this.currentIdx);
    clearTimeout(this.toh);
    this._resetTransformProps();
    let propSet = {
      top: '0',
      left: '0',
      zx: '0',
      vs: 'hidden',
      bgr: '',
      opc: '1',
      filter: 'none'
    }

    for (let [prop, defVal] of Object.entries(propSet)) {
      this.dock.style.setProperty(`--after-${prop}`, defVal);
      this.dock.style.setProperty(`--before-${prop}`, defVal);
    }

    document.querySelectorAll(this.settings.wheelClass).forEach(
      (wheel) => {
        wheel.style.display = 'none';
        wheel.closest('label').style.display = 'none';
      });

    this.dock.className = this.settings.dockClassName(this.settings.defaultItem + 1);
  }

}
