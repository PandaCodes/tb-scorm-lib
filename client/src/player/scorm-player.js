// import 'whatwg-fetch';
// import 'promise-polyfill';
import scormApi from '../api/scorm-api';

const errorStrings = {
  PARSE_XML: 'Error occured while parsing imsmanifest.xml',
  FORMAT_XML: 'Wrong imsmanifest.xml format',
};
let manifest = null;
let iframe = null;
let resources = null;
let items = null;
let debug = false;
let currentItem = null;
const ns = {};

const log = (...args) => {
  if (debug && console) {
    console.log(...args);
  }
};


const parseItem = (item) => {
  const sequencingTag = item ? item.getElementsByTagNameNS(ns.imsss, 'sequencing')[0] : null;
  const objectivesTag = sequencingTag ? sequencingTag.getElementsByTagNameNS(ns.imsss, 'objectives')[0] : null;
  const objectiveTags = objectivesTag ? objectivesTag.getElementsByTagNameNS(ns.imsss, 'objective') : [];
  const objectives = [].map.call(objectiveTags, obj => ({ id: obj.getAttribute('objectiveID') }));
  const primaryObjective = objectivesTag ? objectivesTag.getElementsByTagNameNS(ns.imsss, 'primaryObjective')[0] : null;

  const dataFromLmsTag = item ? item.getElementsByTagNameNS(ns.adlcp, 'dataFromLMS')[0] : null;
  const launchData = dataFromLmsTag ? dataFromLmsTag.childNodes[0].nodeValue : null;
  const timeLimitActionTag = item ? item.getElementsByTagNameNS(ns.adlcp, 'timeLimitAction')[0] : null;
  const timeLimitAction = timeLimitActionTag ? timeLimitActionTag.childNodes[0].nodeValue : null;

  // v.2004
  const completionThresholdTag = item ? item.getElementsByTagNameNS(ns.adlcp, 'completionThreshold')[0] : null;
  const completionThreshold = completionThresholdTag ? completionThresholdTag.childNodes[0].nodeValue : null;
  const minNormalizedMeasureTag = primaryObjective
    ? primaryObjective.getElementsByTagNameNS(ns.imsss, 'minNormalizedMeasure')[0]
    : null;
  const scaledPassingScore = minNormalizedMeasureTag
    ? minNormalizedMeasureTag.childNodes[0].nodeValue
    : null;
  // v.1.2
  const masteryScoreTag = item ? item.getElementsByTagNameNS(ns.adlcp, 'masteryscore')[0] : null;
  const masteryScore = masteryScoreTag
    ? masteryScoreTag.childNodes[0].nodeValue
    : null;
  const maxTimeAllowedTag = item ? item.getElementsByTagNameNS(ns.adlcp, 'maxTimeAllowed')[0] : null;
  const maxTimeAllowed = maxTimeAllowedTag
    ? maxTimeAllowedTag.childNodes[0].nodeValue
    : null;
  return {
    timeLimitAction,
    maxTimeAllowed,
    scaledPassingScore,
    masteryScore,
    completionThreshold,
    objectives,
    launchData,
  };
};

export default {
  init(wrapper, rootUrl, options) {
    iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    document.getElementById(wrapper).appendChild(iframe);
    debug = options.debug;
    return fetch(`${rootUrl}/imsmanifest.xml`)
      .then(responce => responce.text().then((xmlText) => {
        const parser = new DOMParser();
        // opera mini works bad with parseFromString
        manifest = parser.parseFromString(xmlText, 'text/xml');

        if (manifest.documentElement.nodeName === 'parsererror') {
          log(errorStrings.PARSE_XML);
        }
        // xml validation??? error throws
        // Find version info and load API

        // Schema version
        const sv = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
        log('Schema version', sv);
        const schemaVersion = sv === '1.2' || sv === '1.1' ? '1.2' : '2004';

        // namespaces
        const manifestTag = manifest.getElementsByTagName('manifest')[0];
        ns.imsss = manifestTag ? manifestTag.getAttribute('xmlns:imsss') : '';
        ns.adlcp = manifestTag ? manifestTag.getAttribute('xmlns:adlcp') : '';
        // <resourses>
        resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');
        // <organization>
        items = manifest.getElementsByTagName('organization')[0].getElementsByTagName('item');

        currentItem = items[0];
        const initModel = Object.assign({}, options.initModel || {}, parseItem(currentItem));

        return scormApi.init(Object.assign({}, options, {
          schemaVersion,
          initModel,
          callbacks: { onTerminate: () => { iframe.src = ''; } }, // todo: what if... (check time sequencing) + callback from options
        })).then(() => {
          const firstIdRef = currentItem.getAttribute('identifierref');
          const firstRes = [].find.call(resources, res => res.getAttribute('identifier') === firstIdRef);
          iframe.src = `${rootUrl}/${firstRes.getAttribute('href')}`;
        });
      }));
  },
};
