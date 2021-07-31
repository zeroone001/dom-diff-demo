import h from './mySnabbdom/h';
// import patch from './mySnabbdom/patch.js';

const vNode = h('div', {
    key: 1,
    class: {
        btn: true
    }
}, '我是vnode1');
const vNode2 = h('div', {
    key: 2
}, [h('span')]);
// const container = document.getElementById('container');

// patch(container, vnode1);
console.log(vNode, vNode2);

