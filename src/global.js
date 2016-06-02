import Lighthouse from './lighthouse';

const _mhq = window._mhq || '';
const client = new Lighthouse(_mhq);

global.lighthouse = client;
