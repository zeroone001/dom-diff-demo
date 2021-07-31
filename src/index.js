import h from './mySnabbdom/h';
import patch from './mySnabbdom/patch.js';

const vNode = h('div', {
    key: 1,
    class: {
        btn: true
    }
}, '我是vnode1');
const vNode2 = h('div', {
    key: 2
}, [h('span', {}, '我是VNode--->2')]);
const container = document.getElementById('container');

new patch(container, vNode);

new patch(vNode, vNode2);

console.log(vNode, vNode2);

