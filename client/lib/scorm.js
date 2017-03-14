(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("scorm-rte", [], factory);
	else if(typeof exports === 'object')
		exports["scorm-rte"] = factory();
	else
		root["scorm-rte"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.SCORMApi = function () {
  var _this = this;

  // predefined constants
  var LMSVersion = '1.0';

  var error_strings = {
    0: 'No error',
    // General Errors 100-199
    101: 'General Exception',
    102: 'General Initialization Failure',
    103: 'Already Initialized',
    104: 'Content Instance Terminated',
    111: 'General Termination Failure',
    112: 'Termination Before Initialization',
    113: 'Termination After Termination',
    122: 'Retrieve Data Before Initialization',
    123: 'Retrieve Data After Termination',
    132: 'Store Data Before Initialization',
    133: 'Store Data After Termination',
    142: 'Commit Before Initialization',
    143: 'Commit After Termination',
    // Syntax Errors 200-299
    201: 'General Argument Error',
    // RTS (LMS) Errors 300-399
    301: 'General Get Failure',
    351: 'General Set Failure',
    391: 'General Commit Failure',
    // Data Model Errors 400-499
    401: 'Undefined Data Model Element',
    402: 'Unimplemented Data Model Element',
    403: 'Data Model Element Value Not Initialized',
    404: 'Data Model Element Is Read Only',
    405: 'Data Model Element Is Write Only',
    406: 'Data Model Element Type Mismatch',
    407: 'Data Model Element Value Out Of Range',
    408: 'Data Model Dependency Not Established',
    // Implementation-defined Errors 1000-65535
    1000: 'General communication failure (Ajax)'
  };
  var functionNames = {
    2004: {
      Initialize: 'Initialize',
      Terminate: 'Terminate',
      GetValue: 'GetValue',
      SetValue: 'SetValue',
      Commit: 'Commit',
      GetLastError: 'GetLastError',
      GetErrorString: 'GetErrorString',
      GetDiagnostic: 'GetDiagnostic'
    },
    1.2: {
      Initialize: 'LMSInitialize',
      Terminate: 'LMSFinish',
      GetValue: 'LMSGetValue',
      SetValue: 'LMSSetValue',
      Commit: 'LMSCommit',
      GetLastError: 'LMSGetLastError',
      GetErrorString: 'LMSGetErrorString',
      GetDiagnostic: 'LMSGetDiagnostic'
    }
  };
  var STATE = {
    NOT_INITIALIZED: 'Not Initialized',
    RUNNING: 'Running',
    TERMINATED: 'Terminated'
  };
  var cmiDefault = {
    'cmi._version': LMSVersion,
    'cmi.mode': 'normal',
    'cmi.credit': 'no-credit',
    'cmi.entry': 'ab-initio',
    'cmi.location': '',
    'cmi.success_status': 'unknown',
    'cmi.completion_status': 'incomplete',
    'cmi.score._children': 'scaled,min,max,raw',
    'cmi.interactions._children': '',
    // "id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description",
    'cmi.interactions._count': '0'
  };

  var needLogging = false;
  var state = null;
  var error = 0;
  var cmi = null;
  var _valuesChanged = {};

  var _valueNameSecurityCheckRe = /^(cmi||adl)\.(\w|\.)+$/;

  // help functions
  var _stringEndsWith = function _stringEndsWith(str, suffix) {
    return str.length >= suffix.length && str.substr(str.length - suffix.length) == suffix;
  };
  var _valueNameSecurityCheck = function _valueNameSecurityCheck(name) {
    error = name.search(_valueNameSecurityCheckRe) === 0 ? 0 : 401;
    return error === 0;
  };
  var _valueNameCheckReadOnly = function _valueNameCheckReadOnly(name) {
    error = 0;
    if (_stringEndsWith(name, '._children')) {
      error = 403;
    }
    return error === 0;
  };
  var _checkRunning = function _checkRunning(errBefore, errAfter) {
    if (state === STATE.NOT_INITIALIZED) {
      error = errBefore;
    } else if (state === STATE.TERMINATED) {
      error = errAfter;
    } else {
      error = 0;
    }
    return error === 0;
  };
  var _log = function _log() {
    if (needLogging && console) {
      var _console;

      (_console = console).log.apply(_console, arguments);
    }
  };

  var init = function init(_ref) {
    var dataUrl = _ref.dataUrl,
        _ref$version = _ref.version,
        version = _ref$version === undefined ? '2004' : _ref$version,
        _ref$debug = _ref.debug,
        debug = _ref$debug === undefined ? false : _ref$debug,
        _ref$autoCommitInterv = _ref.autoCommitInterval,
        autoCommitInterval = _ref$autoCommitInterv === undefined ? -1 : _ref$autoCommitInterv,
        callbacks = _ref.callbacks;

    // Pre init
    state = STATE.NOT_INITIALIZED;
    needLogging = debug === true;

    // clone default cmi
    // or download the old one
    // Promise ??
    if (dataUrl) {
      fetch(dataUrl).then(function (responce) {
        var storedCmi = JSON.parse(responce);
        cmi = Object.assign({}, cmiDefault, storedCmi);
      }).catch(console.log);
    } else {
      cmi = Object.assign({}, cmiDefault);
    }

    if (callbacks && callbacks.preInitialize) {
      callbacks.preInitialize(cmi);
    }

    var fnms = version === '1.2' ? functionNames['1.2'] : functionNames['2004'];
    var API = {};

    // auto commit
    var lastCommit = Date.now();
    var commitInterval = null;
    if (typeof autoCommitInterval === 'number' && autoCommitInterval > 0) {
      commitInterval = setInterval(function () {
        var now = Date.now();
        if (now - lastCommit > autoCommitInterval * 1000) {
          API[fnms.Commit]();
        }
      }, autoCommitInterval * 1000 / 2);
    }

    // SCO RTE functions
    API[fnms.Initialize] = function () {
      _log('LMS Initialize');
      if (state === STATE.RUNNING) {
        error = 103;
        return 'false';
      }
      if (state === STATE.TERMINATED) {
        error = 103;
        return 'false';
      }
      state = STATE.RUNNING;
      error = 0;
      var callbackResult = 'true';
      if (callbacks && callbacks.Initialize) {
        callbackResult = callbacks.Initialize();
      }
      if (callbackResult === 'false') return 'false';

      return 'true';
    };

    API[fnms.Terminate] = function () {
      _log('LMS Terminate');
      if (!_checkRunning(112, 113)) return 'false';

      _this[fnms.Commit]();
      state = STATE.TERMINATED;
      clearInterval(commitInterval);

      var callbackResult = 'true';
      if (callbacks && callbacks.Terminate) {
        callbackResult = callbacks.Terminate();
      }
      if (callbackResult === 'false') return 'false';

      return 'true';
    };

    API[fnms.GetValue] = function (name) {
      _log('LMS GetValue', name);
      if (!_checkRunning(122, 123)) {
        return '';
      }
      if (!_valueNameSecurityCheck(name)) return '';

      var retval = cmi[name];
      if (typeof retval === 'undefined') {
        retval = '';
      }

      _log('LMS GetValue return: ', retval);
      return retval;
    };

    API[fnms.SetValue] = function (name, value) {
      _log('LMS SetValue', name, value);
      if (!_checkRunning(132, 133)) return 'false';
      if (!_valueNameSecurityCheck(name)) return 'false';
      if (!_valueNameCheckReadOnly(name)) return 'false';

      _valuesChanged[name] = value;
      return 'true';
    }, API[fnms.Commit] = function () {
      _log('LMS Commit', _valuesChanged);
      if (!_checkRunning(142, 143)) return 'false';

      Object.assign(cmi, _valuesChanged);
      // TODO: Promise, errors
      if (dataUrl) {
        fetch(dataUrl, { method: 'POST', body: JSON.stringify(cmi) }).catch(console.log);
      }

      var callbackResult = 'true';
      if (callbacks && callbacks.Commit) {
        callbackResult = callbacks.Commit(cmi, _valuesChanged);
      }
      if (callbackResult === 'false') return 'false';

      lastCommit = Date.now();
      _valuesChanged = {}; // clean changed values
      return 'true';
    };

    API[fnms.GetDiagnostic] = function (errCode) {
      _log('LMS GetDiagnostic', errCode);
      if (!errCode) return _this[fnms.GetLastError]();
      return error_strings[errCode] ? error_strings[errCode] : 'Uknown errCode.';
    };

    API[fnms.GetErrorString] = function (errCode) {
      _log('LMS GetErrorString', errCode);
      return error_strings[errCode] ? error_strings[errCode] : '';
    };

    API[fnms.GetLastError] = function () {
      if (error != 0) _log('LMS GetLastError return', error);
      return error;
    };

    // global api object set
    if (version === '1.2') {
      window.API = API;
    } else {
      window.API_1484_11 = API;
    }
  };

  return { init: init };
}();

/***/ }),
/* 1 */
/***/ (function(module, exports) {

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.SCORMPlayer = function (_ref) {
  var wrapper = _ref.wrapper,
      rootUrl = _ref.rootUrl,
      dataUrl = _ref.dataUrl,
      debug = _ref.debug;

  var error_strings = {
    PARSE_XML: 'Error occured while parsing imsmanifest.xml',
    FORMAT_XML: 'Wrong imsmanifest.xml format'
  };
  var loaded = false;
  var manifest = null;
  var iframe = null;
  var resources = null;
  var organization = null;
  var currentItem = null;

  iframe = document.createElement('iframe');
  wrapper.appendChild(iframe);
  fetch(rootUrl + '/imsmanifest.xml').then(function (responce) {
    return responce.text().then(function (xmlText) {
      var parser = new DOMParser();
      manifest = parser.parseFromString(xmlText, 'text/xml');

      if (manifest.documentElement.nodeName === 'parsererror') {}

      // xml validation??? error throws
      // Find version info and load API
      var schemaVersion = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
      console.log(schemaVersion);
      var version = schemaVersion === '1.2' ? '1.2' : '2004';
      SCORMApi.init({ version: version, dataUrl: dataUrl, debug: debug });
      // <resourses>
      resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');
      // <organization>
      organization = manifest.getElementsByTagName('organization')[0].getElementsByTagName('item');

      var firstIdRef = organization[0].getAttribute('identifierref');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = resources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var res = _step.value;

          if (res.getAttribute('identifier') === firstIdRef) {
            iframe.src = rootUrl + '/' + res.getAttribute('href');
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
  });

  return this;
};

/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
__webpack_require__(0);
module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});