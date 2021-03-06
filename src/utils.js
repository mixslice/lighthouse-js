// link generator
export function getParameterByName(name) {
  const newName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + newName + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null
    ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * mark as deprecated
 */
export function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2');
  }

  return uri + separator + key + '=' + value;
}

/**
 * mark as deprecated
 */
export function removeURLParameter(url, parameter) {
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

export function setCookie(key, value) {
  if (typeof(document) !== 'undefined') {
    document.cookie = `${key}=${value}`;
  }
}

export function getCookie(key) {
  if (typeof(document) === 'undefined') {
    return null;
  }
  return (document.cookie.match('(^|; )' + key + '=([^;]*)') || 0)[2];
}

export function generateUUID() {
  let date = new Date().getTime();
  const uuidFormatString = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  const uuid = uuidFormatString.replace(/[xy]/g, char => {
    const randNumber = (date + Math.random() * 16) % 16 | 0;
    date = Math.floor(randNumber / 16);
    return (char === 'x' ? randNumber : (randNumber & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

// private utility function
export function getUnixtime() {
  return parseInt(new Date().getTime().toString());
}
