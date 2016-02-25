import Lighthouse from './Lighthouse';

const _mhq = window._mhq || '';
const client = new Lighthouse(_mhq);

global.mh = client;
