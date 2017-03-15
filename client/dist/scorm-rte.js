var scormRte =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _scormApi = __webpack_require__(1);

var _scormApi2 = _interopRequireDefault(_scormApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var errorStrings = {
  PARSE_XML: 'Error occured while parsing imsmanifest.xml',
  FORMAT_XML: 'Wrong imsmanifest.xml format'
};
var loaded = false;
var manifest = null;
var iframe = null;
var resources = null;
var organization = null;
var currentItem = null;

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    iframe = document.createElement('iframe');
  }

  _createClass(_class, [{
    key: 'init',
    value: function init(_ref) {
      var wrapper = _ref.wrapper,
          rootUrl = _ref.rootUrl,
          dataUrl = _ref.dataUrl,
          debug = _ref.debug;

      wrapper.appendChild(iframe);
      return fetch(rootUrl + '/imsmanifest.xml').then(function (responce) {
        return responce.text().then(function (xmlText) {
          var parser = new DOMParser();
          // opera mini works bad with parseFromString
          manifest = parser.parseFromString(xmlText, 'text/xml');

          if (manifest.documentElement.nodeName === 'parsererror') {}

          // xml validation??? error throws
          // Find version info and load API
          var schemaVersion = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
          if (debug) {
            console.log('schema version', schemaVersion);
          }
          var version = schemaVersion === '1.2' ? '1.2' : '2004';
          return _scormApi2.default.init({ version: version, dataUrl: dataUrl, debug: debug }).then(function () {
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
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// predefined constants
var LMSVersion = '1.0';
var errorStrings = {
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
  1000: 'General communication failure'
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
var changedValues = {};

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
var log = function log() {
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
      callbacks = _ref.callbacks,
      modelInit = _ref.modelInit;

  // Pre init
  state = STATE.NOT_INITIALIZED;
  needLogging = debug === true;

  // clone default cmi
  // or download the old one
  cmi = Object.assign({}, cmiDefault, modelInit);
  var initCmi = dataUrl ? fetch(dataUrl).then(function (responce) {
    return responce.json();
  }).then(function (json) {
    return JSON.parse(json);
  }).then(function (storedCmi) {
    log('Fetched cmi from server', storedCmi);
    cmi = Object.assign({}, cmiDefault, storedCmi);
  }).catch(log) : Promise.resolve();

  return initCmi.then(function () {
    if (callbacks && callbacks.preInitialize) {
      callbacks.preInitialize();
    }

    var fnms = version === '1.2' ? functionNames['1.2'] : functionNames['2004'];
    var API = {};

    // auto commit
    var lastCommit = Date.now();
    var commitInterval = null;
    if (typeof autoCommitInterval === 'number' && autoCommitInterval > 0) {
      log('Auto-commit enabled');
      commitInterval = setInterval(function () {
        console.log('Ai'); //?? TODO
        var now = Date.now();
        if (now - lastCommit > autoCommitInterval * 1000) {
          API[fnms.Commit]();
        }
      }, autoCommitInterval * 1000 / 2);
    }

    // SCO RTE functions
    API[fnms.Initialize] = function () {
      log('LMS Initialize');
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
      log('LMS Terminate');
      if (!_checkRunning(112, 113)) return 'false';

      API[fnms.Commit](); // ??
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
      log('LMS GetValue', name);
      if (!_checkRunning(122, 123)) {
        return '';
      }
      if (!_valueNameSecurityCheck(name)) return '';

      var retval = cmi[name];
      if (typeof retval === 'undefined') {
        retval = '';
      }

      log('LMS GetValue return: ', retval);
      return retval;
    };

    API[fnms.SetValue] = function (name, value) {
      log('LMS SetValue', name, value);
      if (!_checkRunning(132, 133)) return 'false';
      if (!_valueNameSecurityCheck(name)) return 'false';
      if (!_valueNameCheckReadOnly(name)) return 'false';

      changedValues[name] = value;
      return 'true';
    }, API[fnms.Commit] = function () {
      log('LMS Commit', changedValues);
      if (!_checkRunning(142, 143)) return 'false';

      Object.assign(cmi, changedValues);
      // TODO: Promise, errors
      if (dataUrl) {
        fetch(dataUrl, { method: 'POST', body: JSON.stringify(cmi) }).catch(log);
      }

      var callbackResult = 'true';
      if (callbacks && callbacks.Commit) {
        callbackResult = callbacks.Commit();
      }
      if (callbackResult === 'false') return 'false';

      lastCommit = Date.now();
      changedValues = {}; // clean changed values
      return 'true';
    };

    API[fnms.GetDiagnostic] = function (errCode) {
      log('LMS GetDiagnostic', errCode);
      if (!errCode) return API[fnms.GetLastError]();
      return errorStrings[errCode] ? errorStrings[errCode] : 'Uknown errCode.';
    };

    API[fnms.GetErrorString] = function (errCode) {
      log('LMS GetErrorString', errCode);
      return errorStrings[errCode] ? errorStrings[errCode] : '';
    };

    API[fnms.GetLastError] = function () {
      if (error !== 0) log('LMS GetLastError return', error);
      return error;
    };

    // global api object set
    if (version === '1.2') {
      window.API = API;
    } else {
      window.API_1484_11 = API;
    }
  });
};

var getDataModel = function getDataModel() {
  return Object.assign({}, cmi);
};

exports.default = { init: init, getDataModel: getDataModel };
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);