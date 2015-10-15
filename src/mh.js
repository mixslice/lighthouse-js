export default class Client {

  constructor(token) {
    this.token = token;

    this.config = {
      test: false,
      debug: false,
      endpoint_path: 'http://svr.digitwalk.com/gw/track'
    };

    let _mh = this.getCookie('_mh');
    if (!_mh) {
      _mh = this.generateUUID();
      document.cookie = '_mh=' + _mh;
    }
    this.userIdentifier = _mh;
  }

  getCookie(key) {
    return (document.cookie.match('(^|; )' + key + '=([^;]*)') || 0)[2];
  }

  generateUUID() {
    let date = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
      const randNumber = (date + Math.random() * 16) % 16 | 0;
      date = Math.floor(randNumber / 16);
      return (character === 'x' ? randNumber : (randNumber & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  // private utility function
  getUnixtime() {
    return parseInt(new Date().getTime().toString().substring(0, 10), 10);
  }

  /**
  send_request(data)
  ---
  this function sends an async GET request to mixpanel

  data:object                     the data to send in the request
  callback:function(err:Error)    callback is called when the request is
  finished or an error occurs
  */
  sendRequest(data, callback) {
    const requestData = JSON.parse(JSON.stringify(data));

    if (this.config.test) { requestData.test = 1; }

    const requestUrl = this.config.endpoint_path;

    function ajax(url, success, failure) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (this.readyState === 4) {
          if (this.status === 200) {
            success(this.responseText);
          } else {
            failure(this.statusText);
          }
        }
      };

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.send(JSON.stringify(requestData));
    }

    ajax(requestUrl, responseData => {
      // Got some data
      if (callback !== undefined) {
        const error = (responseData !== '1')
          ? new Error('Maihoo Server Error') : undefined;
        callback(error);
      }
    }, error => {
      if (this.config.debug) {
        console.log('Got Error: ' + error.message);
      }
      if (callback !== undefined) {
        callback(error);
      }
    });
  }

  mergeObject(obj1, obj2) {
    for (const prop in obj2) {
      if (obj2.hasOwnProperty(prop)) {
        obj1[prop] = obj2[prop];
      }
    }
  }

  register(properties) {
    this.properties = this.properties || {};
    this.mergeObject(this.properties, properties);
  }

  identify(uid) {
    this.userIdentifier = uid;
  }

  /**
  track(event, properties, callback)
  ---
  this function sends an event to mixpanel

  event:string                    the event name
  properties:object               additional event properties to send
  callback:function(err:Error)    callback is called when the request is
  finished or an error occurs
  */
  track(event, properties, callback) {
    if (!this.properties) { this.properties = {}; }
    let newProperties = properties;
    if (!newProperties) { newProperties = {}; }
    newProperties.time = this.getUnixtime();

    const mergedProperties = JSON.parse(JSON.stringify(this.properties));
    this.mergeObject(newProperties, properties);

    const data = {
      event: event,
      projectToken: this.token,
      properties: mergedProperties
    };

    if (this.userIdentifier) {
      data.userIdentifier = this.userIdentifier;
    }

    if (this.config.debug) {
      console.log('Sending the following event to Maihoo:');
      console.log(data);
    }

    this.send_request(data, callback);
  }

  /**
  * track link
  */
  trackLinks(query, event, properties) {
    const els = Array.prototype.slice.call(document.querySelectorAll(query), 0);
    els.forEach(el => {
      el.removeEventListener();
      el.addEventListener('click', () =>
        this.track(event, properties));
    });
  }

  /**
  set_config(config)
  ---
  Modifies the maihoo config

  config:object       an object with properties to override in the
  maihoo client config
  */
  setConfig(config) {
    this.mergeObject(this.config, config);
  }
}
