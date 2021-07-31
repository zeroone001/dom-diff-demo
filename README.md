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
    tag: 'div',
    text: '啦啦啦啦'
}

```

### h 函数

虚拟DOM（下文称VNode）就是使用js的普通对象来描述DOM的类型、属性、子元素等信息，一般通过名为h的函数来创建

### patch函数

patch 函数是主函数，主要用来进行新旧vnode的对比，找到差异来更新实际的DOM
它接收两个参数，第一个参数可以是DOM元素或者是VNode，表示旧的VNode，第二参数表示新的VNode，一般只有第一次调用时才会传DOM元素，如果第一个参数为DOM元素的话我们直接忽略它的子元素把它转为一个VNode


### diff 函数




参考文章

[手写一个虚拟DOM库，彻底让你理解diff算法](https://juejin.cn/post/6984939221681176607)
