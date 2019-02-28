// import 'whatwg-fetch';
// import 'promise-polyfill';
import scormApi from '../api/scorm-api';
import OrganizationTree from './organization-tree';
// import * as p from './deep-node-parser';

const errorStrings = {
  PARSE_XML: 'Error occured while parsing imsmanifest.xml',
  FORMAT_XML: 'Wrong imsmanifest.xml format',
};
let manifest = null;
let iframe = null;
let resources = null;
let organizationTree = null;
let rootUrl = null;
let debug = false;
const ns = {};

const log = (...args) => {
  if (debug && console) {
    console.log(...args);
  }
};

// todo: agName = array, namespaces = :
function getValueIn(node, tagName, namespace) {
  if (!node) return null;
  const tag = namespace
    ? node.getElementsByTagNameNS(namespace, tagName)[0]
    : node.getElementsByTagName(tagName)[0];
  return tag
    ? tag.childNodes[0].nodeValue
    : null;
}

function parseSequencing(item) {
  const sequencingTag = item ? item.getElementsByTagNameNS(ns.imsss, 'sequencing')[0] : null;
  const objectivesTag = sequencingTag ? sequencingTag.getElementsByTagNameNS(ns.imsss, 'objectives')[0] : null;
  const primaryObjective = objectivesTag ? objectivesTag.getElementsByTagNameNS(ns.imsss, 'primaryObjective')[0] : null;
  const objectiveTags = objectivesTag ? objectivesTag.getElementsByTagNameNS(ns.imsss, 'objective') : [];
  const objectives = [].map.call(objectiveTags, obj => ({ id: obj.getAttribute('objectiveID') }));

  // v.2004
  const scaledPassingScore = getValueIn(primaryObjective, 'minNormalizedMeasure', ns.imsss);
  // TODO: maxTimeAllowed
  const limitConditionsTag = sequencingTag ? sequencingTag.getElementsByTagNameNS(ns.imsss, 'limitConditions')[0] : null;
  const maxTimeAllowed = limitConditionsTag ? limitConditionsTag.getAttribute('attemptAbsoluteDurationLimit') : null;
  return {
    scaledPassingScore,
    objectives,
    maxTimeAllowed,
  };
}

function parseItem(item) {
  const launchData = getValueIn(item, 'dataFromLMS', ns.adlcp);
  const timeLimitAction = getValueIn(item, 'timeLimitAction', ns.adlcp);

  // v.2004
  const completionThreshold = getValueIn(item, 'completionThreshold', ns.adlcp);

  // v.1.2
  const masteryScore = getValueIn(item, 'masteryscore', ns.adlcp);
  const maxTimeAllowed = getValueIn(item, 'maxTimeAllowed', ns.adlcp);

  return Object.assign({
    timeLimitAction,
    maxTimeAllowed,
    masteryScore,
    completionThreshold,
    launchData,
  }, parseSequencing(item));
}

function getItemSrcPath(item) {
  const idRef = item.getAttribute('identifierref');
  const parameters = item.getAttribute('parameters') || '';
  const resource = [].find.call(resources, res => res.getAttribute('identifier') === idRef);
  const relativePath = resource.getAttribute('href');
  return `${rootUrl}/${relativePath}${parameters}`;
}

export default {
  init(wrapper, url, options) {
    rootUrl = url[url.length - 1] === '/' ? url.slice(0, -1) : url;
    // todo: debug parameters
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
        const sv = getValueIn(manifest, 'schemaversion');
        log('Schema version', sv);
        const schemaVersion = sv === '1.2' || sv === '1.1' ? '1.2' : '2004';

        // namespaces
        const manifestTag = manifest.getElementsByTagName('manifest')[0];
        ns.imsss = manifestTag ? manifestTag.getAttribute('xmlns:imsss') : '';
        ns.adlcp = manifestTag ? manifestTag.getAttribute('xmlns:adlcp') : '';

        // <resourses>
        resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');

        // <organization>
        organizationTree = new OrganizationTree(manifest.getElementsByTagName('organization')[0]);
        const currentItem = organizationTree.current();

        const initModel = Object.assign({}, options.initModel || {}, parseItem(currentItem));

        return scormApi.init(Object.assign({}, options, {
          schemaVersion,
          initModel,
          callbacks: { onTerminate: () => { iframe.src = ''; } }, // todo: what if... (check time sequencing) + callback from options
        })).then(() => {
          iframe.src = getItemSrcPath(currentItem);
        });
      }));
  },
  previous() {
    const prevItem = organizationTree.shiftPrev();
    if (!prevItem) throw new Error('No previous item provided');
    iframe.src = getItemSrcPath(prevItem);
  },
  continue() {
    const nextItem = organizationTree.shiftNext();
    if (!nextItem) throw new Error('No next item provided');
    iframe.src = getItemSrcPath(nextItem);
  },
  exit() {

  },
  abandon() {
  },
  hasPrevious() {
    return organizationTree.hasPrev();
  },
  hasContinue() {
    return organizationTree.hasNext();
  },
  hasExit() {
    return false;
  },
  hasAbandon() {
    return false;
  },
};
