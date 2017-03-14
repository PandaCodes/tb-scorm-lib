window.SCORMPlayer = function ({ wrapper, rootUrl, dataUrl, debug }) {
  const error_strings = {
    PARSE_XML: 'Error occured while parsing imsmanifest.xml',
    FORMAT_XML: 'Wrong imsmanifest.xml format',
  };
  const loaded = false;
  let manifest = null;
  let iframe = null;
  let resources = null;
  let organization = null;
  const currentItem = null;

  iframe = document.createElement('iframe');
  wrapper.appendChild(iframe);
  fetch(`${rootUrl}/imsmanifest.xml`)
    .then(responce =>
      responce.text().then((xmlText) => {
        const parser = new DOMParser();
        manifest = parser.parseFromString(xmlText, 'text/xml');

        if (manifest.documentElement.nodeName === 'parsererror') {

        }

        // xml validation??? error throws
        // Find version info and load API
        const schemaVersion = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
        console.log(schemaVersion);
        const version = schemaVersion === '1.2' ? '1.2' : '2004';
        SCORMApi.init({ version, dataUrl, debug });
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
      }));


  return this;
};

