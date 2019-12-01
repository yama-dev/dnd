import { checkNode } from './utils/check'
import { DOCUMENT_ADDR } from './config'
import store from './store'
import { methods } from './store'

class Drop {
  constructor (el, options) {
    this.initData(el, options) && this.init()
  }

  /**
   * 检查并初始化传入参数
   */
  initData (el, options) {
    this.el = checkNode(el)
    if (!this.el) return
    this.options = this.checkOptions(options)
    if (!this.options) return
    this.methods = methods
    this.index = -1 // 当前索引
    return true
  }

  /**
   * 检查并且初始化options
   */
  checkOptions (options) {
    if (!options) {
      return console.error(this.el, '未检测到options 请参考相关说明' + DOCUMENT_ADDR)
    }
    if (typeof options.onDrop !== 'function') {
      return console.error(this.el, 'onDrop 必须是一个函数 请参考相关说明' + DOCUMENT_ADDR)
    }
    let baseOptions = {
      name: null
    }
    for (let option in baseOptions) {
      !options[options] && (options[options] = baseOptions[option])
    }
    return options
  }

  /**
   * initialization.
   */
  init () {
    this.setStore()
  }

  /**
   * 托管状态
   */
  setStore () {
    let index = store.targets.push({
      el: this.el,
      name: this.options.name,
      expand: this.options.expand
    }) - 1
    this.index = index

    store.targetOnDragStarts[index] = this.onDragStart.bind(this)
    store.targetOnDragEnds[index] = this.onDragEnd.bind(this)
    store.onDragEnters[index] = this.onDragEnter.bind(this)
    store.onDragOvers[index] = this.onDragOver.bind(this)
    store.onDragLeaves[index] = this.onDragLeave.bind(this)
    store.onDrops[index] = this.onDrop.bind(this)
  }

  /**
   * 目标监听到拖动开始
   */
  onDragStart (params) {
    this.setStorePositions()
    this.emit('onDragStart', params)
  }

  /**
   * 目标监听到拖动结束
   */
  onDragEnd (params) {
    this.emit('onDragEnd', params)
  }

  /**
   * 目标监听到拖动进入当前范围
   */
  onDragEnter (params) {
    this.emit('onDragEnter', params)
  }

  /**
   * 目标监听在自己上方拖动
   */
  onDragOver (params) {
    this.emit('onDragOver', params)
  }

  /**
   * 目标监听到离开当前范围
   */
  onDragLeave (params) {
    this.emit('onDragLeave', params)
  }

  /**
   * 目标监听到被拖动元素在自己范围内放下
   */
  onDrop (params) {
    this.emit('onDrop', params)
  }

  /**
   * position host
   */
  setStorePositions () {
    let {left, top, width, height} = this.el.getBoundingClientRect()
    store.targetPositions[this.index] = {
      top: top,
      bottom: top + height,
      left: left,
      right: left + width
    }
  }

  /**
   * send event.
   */
  emit () {
    let args = Array.from(arguments)
    let functionName = args.shift()
    typeof this.options[functionName] === 'function' && this.options[functionName](...args)
  }
}

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };
    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

module.exports = Drop
