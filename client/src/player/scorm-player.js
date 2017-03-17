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
let organization = null;
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
        const schemaVersion = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
        log('Schema version', schemaVersion);
        const version = schemaVersion === '1.2' ? '1.2' : '2004';
        return scormApi.init(Object.assign({}, options, { version })).then(() => {
            // <resourses>
          resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');
            // <organization>
          organization = manifest.getElementsByTagName('organization')[0].getElementsByTagName('item');

          const firstIdRef = organization[0].getAttribute('identifierref');
          const firstRes = [].find.call(resources, res => res.getAttribute('identifier') === firstIdRef);
          iframe.src = `${rootUrl}/${firstRes.getAttribute('href')}`;
        });
      }));
  },
};
