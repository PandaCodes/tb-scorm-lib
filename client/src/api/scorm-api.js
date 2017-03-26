// import 'whatwg-fetch';
// predefined constants
import * as d from './dictionary';
import { stringEndsWith, post } from './utils';

const STATE = {
  NOT_INITIALIZED: 'Not Initialized',
  RUNNING: 'Running',
  TERMINATED: 'Terminated',
};

let needLogging = false; // bad name (variable duplication)
let state = null;
let error = 0;
let cmi = null;
let changedValues = {};

const valueNameSecurityCheckRe = /^(cmi||adl)\.(\w|\.)+$/;

// Check error functions
const valueNameSecurityCheck = (name) => {
  error = name.search(valueNameSecurityCheckRe) === 0 ? 0 : 401;
  return error === 0;
};
const valueNameReadOnlyCheck = (name) => {
  error = 0;
  if (stringEndsWith(name, '._children')) {
    error = 403;
  }
  return error === 0;
};
const stateCheck = (errBefore, errAfter) => {
  if (state === STATE.NOT_INITIALIZED) {
    error = errBefore;
  } else if (state === STATE.TERMINATED) {
    error = errAfter;
  } else {
    error = 0;
  }
  return error === 0;
};

const log = (...args) => {
  if (needLogging && console) {
    console.log(...args);
  }
};

export default {
  init({
    dataUrl,
    schemaVersion = '2004',
    debug = false,
    autoCommitInterval = -1, // in seconds
    callbacks,
    initModel,
  }) {
    // Pre init
    state = STATE.NOT_INITIALIZED;
    needLogging = debug === true;
    d.setSchemaVersion(schemaVersion);
    const cmiDefault = d.getCmiDefault();
    const cmiInit = d.createModel(initModel);
    log('Init model', cmiInit);

    // clone default cmi
    // or download the old one
    cmi = Object.assign({}, cmiDefault, cmiInit);
    const initCmi = dataUrl ?
      fetch(dataUrl)
      .then(responce => responce.json())
      .then(json => JSON.parse(json))
      .then((storedCmi) => {
        log('Fetched cmi from server', storedCmi);
        cmi = Object.assign({}, cmiDefault, cmiInit, storedCmi);
      })
      .catch(log)
      : Promise.resolve();

    return initCmi.then(() => {
      if (callbacks && callbacks.preInitialize) { callbacks.preInitialize(); }

      const errorStrings = d.getErrorStrings();
      const fnms = d.getFunctionNames();
      const API = {};

      // Auto commit
      let lastCommit = Date.now();
      let commitInterval = null;
      if (typeof autoCommitInterval === 'number' && autoCommitInterval > 0) {
        log('Auto-commit enabled', setInterval);
        commitInterval = setInterval(() => {
          console.log('Ai');// ?? TODO doesn't work(
          /* const now = Date.now();
          if (now - lastCommit > autoCommitInterval * 1000) {
            API[fnms.Commit]();
          }*/
        }, autoCommitInterval * 100);
      }

      // SCO RTE functions
      API[fnms.Initialize] = () => {
        log('LMS Initialize');
        if (state === STATE.RUNNING || state === STATE.TERMINATED) {
          error = 103;
          return 'false';
        }

        state = STATE.RUNNING;
        error = 0;
        let callbackResult = 'true';
        if (callbacks && callbacks.onInitialize) { callbackResult = callbacks.onInitialize(); }
        if (callbackResult === 'false') {
          error = 102;
          return 'false';
        }

        return 'true';
      };

      API[fnms.Terminate] = () => {
        log('LMS Terminate');
        if (!stateCheck(112, 113)) return 'false';

        // ugly? TODO: to think
        if (changedValues[d.exit()] === '') { post(dataUrl, '').catch(log); }
        if (changedValues[d.exit()] === 'suspend' || changedValues[d.exit()] === 'time-out') {
          // changedValues[d.entry()] = 'resume';
          API[fnms.Commit]();
        }
        // other? TODO

        let callbackResult = 'true';
        if (callbacks && callbacks.onTerminate) { callbackResult = callbacks.onTerminate(); }
        if (callbackResult === 'false') {
          error = 111;
          return 'false';
        }

        clearInterval(commitInterval);
        state = STATE.TERMINATED;

        return 'true';
      };

      API[fnms.GetValue] = (name) => {
        log('LMS GetValue', name);
        if (!stateCheck(122, 123)) return '';
        if (!valueNameSecurityCheck(name)) return '';
        // TODO: initialized check (_children) ?

        let retval = cmi[name];
        if (typeof (retval) === 'undefined') {
          retval = '';
          error = 403;
        }

        log('LMS GetValue returns: ', retval);
        return retval;
      };

      API[fnms.SetValue] = (name, value) => {
        log('LMS SetValue', name, value);
        if (!stateCheck(132, 133)) return 'false';
        if (!valueNameSecurityCheck(name)) return 'false';
        if (!valueNameReadOnlyCheck(name)) return 'false';

        // TODO: _children set
        changedValues[name] = value;
        return 'true';
      };

      API[fnms.Commit] = () => {
        log('LMS Commit', changedValues);
        if (!stateCheck(142, 143)) return 'false';

        Object.assign(cmi, changedValues);
        // TODO: Errors (like "Bad connection, sorry..")
        post(dataUrl, JSON.stringify(cmi)).catch(log);

        let callbackResult = 'true';
        if (callbacks && callbacks.onCommit) { callbackResult = callbacks.onCommit(); }
        if (callbackResult === 'false') return 'false';

        lastCommit = Date.now();
        changedValues = {}; // clean changed values
        return 'true';
      };

      API[fnms.GetDiagnostic] = (errCode) => {
        log('LMS GetDiagnostic', errCode);
        if (!errCode) return API[fnms.GetLastError]();
        return errorStrings[errCode] ? errorStrings[errCode] : 'Uknown error';
      };

      API[fnms.GetErrorString] = (errCode) => {
        log('LMS GetErrorString', errCode);
        return errorStrings[errCode] ? errorStrings[errCode] : 'Uknown error';
      };

      API[fnms.GetLastError] = () => {
        if (error !== 0) log('LMS GetLastError return', error);
        return error;
      };

      // global api object set
      if (schemaVersion === '1.2') {
        window.API = API;
      } else {
        window.API_1484_11 = API;
      }
    });
  },

  getDataModel: () => Object.assign({}, cmi),

  // for 2004 schema only
  getProgressMeasure: () => cmi['cmi.progress_measure'],

  getResults: () => {

  },


};

