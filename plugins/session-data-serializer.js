class SessionDataSerializer {
  constructor() {
    this.sessionDataQueryParamKey = "sd";
  }
  parse(base64EncodedData) {
    debugger;
    const urlEncodedJsonData = atob(base64EncodedData);
    const decodedUrlEncodedJsonData = decodeURIComponent(urlEncodedJsonData);
    const paramsObject = JSON.parse(decodedUrlEncodedJsonData);
    return paramsObject;
  }

  encode(sessionParamsObject) {
    const jsonData = JSON.stringify(sessionParamsObject);
    const urlEncodedJsonData = encodeURIComponent(jsonData);
    const base64EncodedData = btoa(urlEncodedJsonData);
    return base64EncodedData;
  }
}

const sessionDataSerializer = new SessionDataSerializer();

export default ({ app }, inject) => {
  inject("sessionDataSerializer", sessionDataSerializer);
};
