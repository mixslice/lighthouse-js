import {
  getParameterByName,
  removeURLParameter,
  getCookie,
  generateUUID,
  getUnixtime,
  ajax
} from './MaihooUtils';

const COOKIE_KEY = '_mh';
const CID_KEY = '__cid__';
const PID_KEY = '__pid__';
const TARGET_KEY = '__target__';
const EVENT_LOGIN = 'login';
const EVENT_CLICK = 'click';

export default class Maihoo {
  constructor(token) {
    this.token = token;

    this.config = {
      test: false,
      debug: false,
      endpoint_path: 'http://svr.digitwalk.com/gw/track'
    };

    const uid = getCookie(COOKIE_KEY) || generateUUID();
    this.identify(uid);

    const cid = getParameterByName(CID_KEY);
    const pid = getParameterByName(PID_KEY);
    const target = getParameterByName(TARGET_KEY) || this.userIdentifier;

    this.register({
      target: target,
      cid: cid,
      pid: pid
    });
  }

  /**
  send_request(data)
  ---
  this function sends an async GET request to mixpanel

  data:object                     the data to send in the request
  callback:function(err:Error)    callback is called when the request is
  finished or an error occurs
  */
  sendRequest(data, callback, async = true) {
    const requestData = JSON.parse(JSON.stringify(data));

    if (this.config.test) { requestData.test = 1; }

    const requestUrl = this.config.endpoint_path;

    const successBlock = responseData => {
      // Got some data
      if (callback) {
        const error = (responseData !== '1')
        ? new Error('Maihoo Server Error') : undefined;
        callback(error);
      }
    };

    const errorBlock = error => {
      if (this.config.debug) {
        console.log('Got Error: ' + error.message);
      }
      if (callback) {
        callback(error);
      }
    };

    ajax(requestUrl,
      JSON.stringify(requestData),
      successBlock,
      errorBlock,
      async);
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
    this.register({ uid: this.userIdentifier });
    this.userIdentifier = uid;
    document.cookie = COOKIE_KEY + '=' + this.userIdentifier;
  }

  registerSocial(openid, service) {
    if (this.userIdentifier === openid) {
      return;
    }

    if (openid && openid.length > 0) {
      this.identify(openid);
    }

    this.register({
      openid: openid,
      service: service
    });

    this.track(EVENT_LOGIN);
  }

  getShareLink(link) {
    const openid = this.properties.openid;
    const cid = this.properties.__cid__;
    const target = this.properties.target;

    let share = link || location.href;

    share = removeURLParameter(share, 'code');
    share = removeURLParameter(share, 'state');
    share = removeURLParameter(share, CID_KEY);
    share = removeURLParameter(share, PID_KEY);
    share = removeURLParameter(share, TARGET_KEY);
    share = share.split('#')[0]
      + '&' + CID_KEY + '=' + openid
      + '&' + PID_KEY + '=' + cid
      + '&' + TARGET_KEY + '=' + target;

    return share;
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
  track(event, properties, callback, async = true) {
    this.properties = this.properties || {};
    const newProperties = properties || {};
    newProperties.time = getUnixtime();

    const mergedProperties = JSON.parse(JSON.stringify(this.properties));
    this.mergeObject(mergedProperties, newProperties);

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

    this.sendRequest(data, callback, async);
  }

  /**
  * track link
  */
  trackLinks(query, event, properties) {
    const els = Array.prototype.slice.call(document.querySelectorAll(query), 0);
    els.forEach(el => {
      el.removeEventListener();
      el.addEventListener(EVENT_CLICK, () =>
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
