// import 'whatwg-fetch';
// import 'promise-polyfill';
import scormApi from '../api/scorm-api';

const errorStrings = {
  PARSE_XML: 'Error occured while parsing imsmanifest.xml',
  FORMAT_XML: 'Wrong imsmanifest.xml format',
};
const loaded = false;
let manifest = null;
let iframe = null;
let resources = null;
let items = null;
let debug = false;
const currentItem = null;

const log = (...args) => {
  if (debug && console) {
    console.log(...args);
  }
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

        // <resourses>
        resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');
        // <organization>
        items = manifest.getElementsByTagName('organization')[0].getElementsByTagName('item');
        // TODO: for every item on loading
        // <imsss:sequencing>
        const manifestTag = manifest.getElementsByTagName('manifest')[0];
        const imsssNS = manifestTag ? manifestTag.getAttribute('xmlns:imsss') : '';
        const sequencingTag = items[0] ? items[0].getElementsByTagNameNS(imsssNS, 'sequencing')[0] : null;
        const objectivesTag = sequencingTag ? sequencingTag.getElementsByTagNameNS(imsssNS, 'objectives')[0] : null;
        let objectives = objectivesTag ? objectivesTag.getElementsByTagNameNS(imsssNS, 'objective') : [];
        objectives = [].map.call(objectives, obj => ({ id: obj.getAttribute('objectiveID') }));

        // Schema version
        const sv = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
        log('Schema version', sv);
        const schemaVersion = sv === '1.2' || sv === '1.1' ? '1.2' : '2004';

        return scormApi.init(Object.assign({}, options, {
          schemaVersion,
          initModel: { objectives },
          callbacks: { onTerminate: () => { iframe.src = ''; } }, // what if... (check time sequencing)
        })).then(() => {
          const firstIdRef = items[0].getAttribute('identifierref');
          const firstRes = [].find.call(resources, res => res.getAttribute('identifier') === firstIdRef);
          iframe.src = `${rootUrl}/${firstRes.getAttribute('href')}`;
        });
      }));
  },
};
