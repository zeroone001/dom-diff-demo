import vnode from './vnode.js';
import h from './h.js';



class Patch {
    constructor (oldNode, newNode) {
        // 判断oldnode是虚拟节点还是真实的DOM
        if (!oldNode.tag) {
            // 真实的DOM，然后把oldNode转为vnode
            // oldNode = vnode(oldNode.tagName.toLowerCase(), {}, [], undefined, oldNode);
            let el = oldNode;
            el.innerHTML = '';
            oldNode = h(el.tagName.toLowerCase());
            oldNode.el = el;
        }
        // 新旧vnode进行比较
        this.patchVNode(oldVNode, newVNode);
    }
    // 对新旧VNode进行比较，并且进行DOM更新
    patchVNode (oldVNode, newVNode) {
        if (oldVNode === newVNode) {
            return;
        }
    
        if (oldVNode.tag === newVNode.tag) {

            let el = newVNode.el = oldVNode.el;
            // newNode 如果是text 节点
            // 删除原来的子节点，并且更新新的text节点
            if (newVNode.text) {
                if (oldVNode.children && oldVNode.children.length) {
                    oldVNode.children.forEach((item) => {
                        el.removeChild(item.el);
                    });
                }
                // 文本内容不相同则更新文本
                if (newVNode.text !== oldVNode.text) {
                    el.textContent = newVNode.text;
                }
            } else {
                /*
                    1.新节点不存在子节点，而旧节点存在，那么移除旧节点的子节点;
                    2.新节点不存在子节点，旧节点存在文本节点，那么移除该文本节点;
                    3.新节点存在子节点，旧节点存在文本节点，那么移除该文本节点，然后插入新节点;
                    4.新旧节点都有子节点的话那么就需要进入到diff阶段;
                */
               if (newVNode.children && newVNode.children.length) {
                    // 新节点存在子节点
                    if (oldNode.children && oldNode.children.length) {

                        // 重点，diff算法
                        diff(el, oldNode.children, newVNode.children);

                    } else if (oldNode.text)  {
                        el.text = '';
                        // 插入newNode 的新的子节点
                        newVNode.children.forEach((item) => {
                            el.appendChild(this.createEl(item));
                        })
                    }
               } else {
                   // 新节点不存在子节点
                    if (oldNode.children && oldNode.children.length) {
                        oldNode.children.forEach((item) => {
                            el.removeChild(item.el);
                        });
                    } else if (oldNode.text) {
                        el.textContent = '';
                    }
               }

            }
    
        } else {
            // 1. 根据VNode 创建DOM
            // 2. 插入DOM结构
            // 3. 删除旧的DOM结构
    
            let newEl = createEl(newVNode);
            let parent = oldVNode.el.parentNode;
            parent.insertBefore(newEl, oldVNode.el);
            parent.removeChild(oldVNode.el);
        }
    }
    diff (el, oldChild, newChild) {

    }
    // 使用递归，把
    createEl (node) {
        let el = document.createElement(node.tag);
        node.el = el;

        // 子节点
        if (node.children && node.children.length) {
            node.children.forEach((item) => {
                el.appendChild(this.createEl(item));
            });
        }

        // 插入文本节点
        if(node.text) {
            el.appendChild(document.createTextNode(node.text));
        }

        return el;

    }
}
export default Patch;
