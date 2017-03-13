"use strict";

window.SCORMPlayer = function (_ref) {
  var wrapper = _ref.wrapper,
      rootUrl = _ref.rootUrl,
      postUrl = _ref.postUrl,
      debug = _ref.debug;

  var error_strings = {
    PARSE_XML: "Error occured while parsing imsmanifest.xml",
    FORMAT_XML: "Wrong imsmanifest.xml format"
  };
  var loaded = false;
  var manifest = null;
  var iframe = null;
  var resources = null;
  var organization = null;
  var currentItem = null;

  iframe = document.createElement('iframe');
  wrapper.appendChild(iframe);
  fetch(rootUrl + "/imsmanifest.xml").then(function (responce) {
    return responce.text().then(function (xmlText) {
      var parser = new DOMParser();
      manifest = parser.parseFromString(xmlText, "text/xml");

      if (manifest.documentElement.nodeName === "parsererror") {}

      //xml validation??? error throws
      //Find version info and load API
      var schemaVersion = manifest.getElementsByTagName('schemaversion')[0].childNodes[0].nodeValue;
      console.log(schemaVersion);
      var version = schemaVersion === '1.2' ? '1.2' : '2004';
      SCORMApi.init({ version: version, postUrl: postUrl, debug: debug });
      //<resourses>
      resources = manifest.getElementsByTagName('resources')[0].getElementsByTagName('resource');
      //<organization>
      organization = manifest.getElementsByTagName('organization')[0].getElementsByTagName('item');

      var firstIdRef = organization[0].getAttribute('identifierref');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = resources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var res = _step.value;

          if (res.getAttribute('identifier') === firstIdRef) {
            iframe.src = rootUrl + "/" + res.getAttribute('href');
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