import h from './mySnabbdom/h';
import patch from './mySnabbdom/patch.js';

const vnode1 = h('div', {}, '我是vnode1');
const container = document.getElementById('container');

patch(container, vnode1);
