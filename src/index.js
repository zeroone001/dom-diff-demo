import h from './mySnabbdom/h';
// import patch from './mySnabbdom/patch.js';

const vNode = h('div', '我是vnode1');
const vNode2 = h('div', [h('span')]);
// const container = document.getElementById('container');

// patch(container, vnode1);
console.log(vNode, vNode2);

