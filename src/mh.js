class Maihoo {
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
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            success(xhr.responseText);
          } else {
            failure(xhr.statusText);
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

  // link generator
  getParameterByName(name) {
    const newName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + newName + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  updateQueryStringParameter(uri, key, value) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    }

    return uri + separator + key + '=' + value;
  }

  removeURLParameter(url, parameter) {
    // prefer to use l.search if you have a location/link object
    const urlparts = url.split('?');
    if (urlparts.length >= 2) {
      const prefix = encodeURIComponent(parameter) + '=';
      const pars = urlparts[1].split(/[&;]/g);

      // reverse iteration as may be destructive
      for (let idx = pars.length; idx-- > 0;) {
        // idiom for string.startsWith
        if (pars[idx].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(idx, 1);
        }
      }

      return urlparts[0] + '?' + pars.join('&');
    }

    return url;
  }

  registerSocial(openid) {
    const cid = this.getParameterByName('__cid__');
    const pid = this.getParameterByName('__pid__');
    const target = this.getParameterByName('__target__');

    if (openid && openid.length > 0) {
      this.identify(openid);
    }

    this.register({
      target: target,
      cid: cid,
      pid: pid,
      openid: openid
    });
  }

  getShareLink(link) {
    const openid = this.properties.openid;
    const cid = this.properties.__cid__;

    let share = link || location.href;

    share = this.removeURLParameter(share, 'code');
    share = this.removeURLParameter(share, 'state');
    share = this.removeURLParameter(share, '__cid__');
    share = this.removeURLParameter(share, '__pid__');
    share = share.split('#')[0] + '&__cid__=' + openid + '&__pid__=' + cid;

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

    this.sendRequest(data, callback);
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

const _mhq = window._mhq || '';
const maihoo = new Maihoo(_mhq);
maihoo.track('page start');

window.onunload = () => {
  maihoo.track('page end');
};

global.maihoo = maihoo;
