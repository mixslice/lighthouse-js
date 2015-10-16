import Maihoo from './Maihoo';

const _mhq = window._mhq || '';
const maihoo = new Maihoo(_mhq);

const pagestart = () => maihoo.track('page start');
const pageend = () => maihoo.track('page end');

if (window.onpagehide || window.onpagehide === null) {
  window.addEventListener('pageshow', pagestart, false);
  window.addEventListener('pagehide', pageend, false);
} else {
  window.addEventListener('load', pagestart, false);
  window.addEventListener('unload', pageend, false);
}

const pageshow = () => maihoo.track('page show');
const pagehide = () => maihoo.track('page hide');

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pagehide();
  } else {
    pageshow();
  }
}, false);

global.maihoo = maihoo;
