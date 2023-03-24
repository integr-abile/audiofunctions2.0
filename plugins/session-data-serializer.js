class SessionDataSerializer {
  constructor() {
    this.sessionDataQueryParamKey = "sd";
  }
  parse(base64EncodedData) {
    const urlEncodedJsonData = atob(base64EncodedData);
    const decodedUrlEncodedJsonData = decodeURIComponent(urlEncodedJsonData);
    try {
      const paramsObject = JSON.parse(decodedUrlEncodedJsonData);
      return paramsObject;
    } catch (e) {
      throw new Error(
        "errore nel parsing dell'url. La pagina verrà configurata con le opzioni di default"
      );
    }
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
