import vnode from './vnode.js';


// h函数
export default function (tag, children) {
    let text = '';
    let el;
    // 子元素是文本节点
    if (typeof children === 'string' || typeof children === 'number') {
        text = children;
        children = undefined;
    } else if (!Array.isArray(children)) {
        children = undefined;
    }

    return {
        tag,
        text,
        children,
        el,
    }
};
 