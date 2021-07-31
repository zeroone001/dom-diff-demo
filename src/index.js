import h from './mySnabbdom/h';
import patch from './mySnabbdom/patch.js';

const vNode = h('div', {
    key: 1,
    class: {
        btn: true
    }
}, [
    h('span', {key: 'A'}, '我是A'),
    h('span', {key: 'B'}, '我是B'),
    h('span', {key: 'C'}, '我是C')
]);
const vNode2 = h('div', {
    key: 2
}, [
    h('span', {key: 'm'}, '我是m'),
    h('span', {key: 'A'}, '我是A'),
    h('span', {key: 'D'}, '我是D'),
    h('span', {key: 'C'}, '我是C'),
    h('span', {key: 'f'}, '我是f')
]);
console.log(vNode, vNode2);
const container = document.getElementById('container');

new patch(container, vNode);

new patch(vNode, vNode2);



