# dom-diff-demo
vue diff 算法研究

## snabbdom diff 算法的鼻祖

npm i -S snabbdom

npm i -D webpack@5 webpack-cli@3 webpack-dev-server@3

### 虚拟节点有哪些属性

```js
{
    children: undefined, // 子元素
    data: { // 属性，样式

    },
    elm: undefined, // 对应的真正的DOM节点
    key: null, // 唯一标识
    sel: 'div',
    text: '啦啦啦啦'
}

```

### patch函数

让虚拟节点上DOM树
