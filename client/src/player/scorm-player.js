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
const currentItem = null;

export default {
  init(wrapper, rootUrl, options) {
    iframe = document.createElement('iframe');
    document.getElementById(wrapper).appendChild(iframe);
    return fetch(`${rootUrl}/imsmanifest.xml`)
      .then(responce => responce.text().then((xmlText) => {
        const parser = new DOMParser();
        // opera mini works bad with parseFromString
        manifest = parser.parseFromString(xmlText, 'text/xml');

        if (manifest.documentElement.nodeName === 'parsererror') {

        }

          // xml validation??? error throws
          // Find version info and load API
        const schemaVersion = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
        if (options.debug) { console.log('schema version', schemaVersion); }
        options.version = schemaVersion === '1.2' ? '1.2' : '2004';
        return scormApi.init(options).then(() => {
            // <resourses>
          resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');
            // <organization>
          organization = manifest.getElementsByTagName('organization')[0].getElementsByTagName('item');

          const firstIdRef = organization[0].getAttribute('identifierref');

          for (const res of resources) {
            if (res.getAttribute('identifier') === firstIdRef) {
              iframe.src = `${rootUrl}/${res.getAttribute('href')}`;
            }
          }
        });
      }));
  }
};
