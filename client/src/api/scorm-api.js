// import 'whatwg-fetch';
// predefined constants
import * as d from './dictionary';
import * as cmi from './cmi';

const STATE = {
  NOT_INITIALIZED: 'Not Initialized',
  RUNNING: 'Running',
  TERMINATED: 'Terminated',
};

let state = null;
let error = 0;

const valueNameSecurityCheckRe = /^(cmi||adl)\.(\w|\.)+$/;

const stringEndsWith = (str, suffix) =>
  str.length >= suffix.length && str.substr(str.length - suffix.length) === suffix;

const isSameHost = (url) => {
  if (!url) return false;
  const matches = url.match(/^(?:https?:\/\/|\/\/)?([^\/]+)\//);
  let domainport = matches && matches[1];
  // if relative path
  if (!domainport || domainport === '..' || domainport === '.') return true;
  domainport = domainport.split(':');
  if (window.location.hostname !== domainport[0]) return false;
  if ((window.location.port || '80') !== (domainport[1] || '80')) return false;
  return true;
};

// Check error functions
const valueNameSecurityCheck = (name) => {
  error = name.search(valueNameSecurityCheckRe) === 0 ? 0 : 401;
  return error === 0;
};
// TODO
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

export default {
  init({
    dataUrl,
    postHeaders, // ?? TODO: is that bad?
    schemaVersion = '2004',
    debug = false,
    autoCommitInterval = -1, // in seconds
    callbacks,
    initModel,
  }) {
    // Pre init
    state = STATE.NOT_INITIALIZED;
    // debug
    const log = (...args) => {
      if (debug && console) {
        console.log(...args);
      }
    };

    // Post - store cmi && results if the dataUrl is present
    const sameHost = isSameHost(dataUrl);
    const headers = sameHost
      ? Object.assign({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }, postHeaders)
      : postHeaders;
    log('Same host:', sameHost);
    const post = dataUrl
      ? (storeCmi = true, sendResults = false) =>
        fetch(dataUrl, {
          headers,
          credentials: 'same-origin',
          method: 'POST',
          body: JSON.stringify({
            scorm_stat: {  // TODO: beauty
              cmiString: storeCmi ? cmi.getJSONString() : '',
              results: sendResults ? cmi.getResults() : null,
            },
          }),
        })
      : () => Promise.resolve();

    cmi.init(schemaVersion, initModel);

    const loadCmi = dataUrl ?
      fetch(dataUrl, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      .then(responce => responce.json())
      .then(json => json.scorm_stat)
      .then((scormStat) => {
        log('Fetched info from server', scormStat);
        cmi.restore(scormStat.cmiString, scormStat.data);
      })
      .catch(log)
      : Promise.resolve();

    return loadCmi.then(() => {
      if (callbacks && callbacks.preInitialize) { callbacks.preInitialize(); }

      const errorStrings = d.getErrorStrings(schemaVersion);
      const fnms = d.getFunctionNames(schemaVersion);
      const API = {};

      // Auto commit
      let lastCommit = Date.now();
      let commitInterval = null;
      if (typeof autoCommitInterval === 'number' && autoCommitInterval > 0) {
        log('Auto-commit enabled', setInterval);
        commitInterval = setInterval(() => {
          // console.log('Ai');// ?? TODO doesn't work(
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

        post(cmi.exit().save, true).catch(log);

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

        let retval = cmi.get(name);
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

        // TODO: _children + R/W permissions
        // TODO: dpecial model interactions
        cmi.set(name, value);
        return 'true';
      };

      API[fnms.Commit] = () => {
        log('LMS Commit');
        if (!stateCheck(142, 143)) return 'false';

        // TODO: Errors (like "Bad connection, sorry..")
        post().catch((e) => { error = 1000; });

        let callbackResult = 'true';
        if (callbacks && callbacks.onCommit) { callbackResult = callbacks.onCommit(); }
        if (callbackResult === 'false') return 'false';

        lastCommit = Date.now();
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

  getCmi: () => cmi,

  // for 2004 schema only
  getProgressMeasure: () => cmi.get('cmi.progress_measure'),

  getResults: () => cmi.getResults(),


};

