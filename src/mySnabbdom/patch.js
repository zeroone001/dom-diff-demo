import vnode from './vnode.js';
import h from './h.js';

// https://mp.weixin.qq.com/s/V_YWbswXoea-Em-l_K97sw 教程

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
        this.patchVNode(oldNode, newNode);
    }
    // 对新旧VNode进行比较，并且进行DOM更新
    patchVNode (oldVNode, newVNode) {
        if (oldVNode === newVNode) {
            return;
        }
    
        if (oldVNode.tag === newVNode.tag) {
            let el = newVNode.el = oldVNode.el;
            // 更新类名
            this.updateClass(el, newVNode);
            // 更新事件
            this.updateEvent(el, oldVNode, newVNode);

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
                    if (oldVNode.children && oldVNode.children.length) {

                        // 重点，diff算法 最复杂的情况
                        diff(el, oldVNode.children, newVNode.children);

                    } else if (oldVNode.text)  {
                        // 代表，oldVNode有text, newVNode有children
                        // 1.删除text 2.插入新的children

                        el.textContent = '';
                        
                        // 插入newNode 的新的子节点
                        newVNode.children.forEach((item) => {
                            el.appendChild(this.createEl(item));
                        })
                    }
               } else {
                   // 新节点不存在子节点
                    if (oldVNode.children && oldVNode.children.length) {
                        oldVNode.children.forEach((item) => {
                            el.removeChild(item.el);
                        });
                    } else if (oldVNode.text) {
                        el.textContent = '';
                    }
               }

            }
    
        } else {
            // 1. 根据VNode 创建DOM
            // 2. 插入DOM结构
            // 3. 删除旧的DOM结构
    
            let newEl = createEl(newVNode);
            // 更新类名
            this.updateClass(newEl, newVNode);
            // 删除所有的事件，防止内存泄漏
            this.removeEvent(oldVNode);
            // 更新事件
            this.updateEvent(newEl, null, newVNode);

            let parent = oldVNode.el.parentNode;
            parent.insertBefore(newEl, oldVNode.el);
            parent.removeChild(oldVNode.el);
        }
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

    isSameNode (a, b) {
        return a.key === b.key && a.tag === b.tag;
    }
    // diff 算法
    diff (el, oldChild, newChild) {
        // 位置指针
        let oldStartIdx = 0;
        let oldEndIdx = oldChild.length - 1;

        let newStartIdx = 0;
        let newEndIdx = newChild.length - 1;


        // 节点指针

        let oldStartNode = oldChild[oldStartIdx];
        let oldEndNode = oldChild[oldEndIdx];

        let newStartNode = newChild[newStartIdx];
        let newEndNode = newChild[newEndIdx];

        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (this.isSameNode(oldStartNode, newStartNode)) {
                
            } else if (this.isSameNode(oldStartNode, newEndNode)) {

            } else if (this.isSameNode(oldEndNode, newStartNode)) {
                
            } else if (this.isSameNode(oldEndNode, newEndNode)) {
                this.patchVNode(oldEndNode, newEndNode);
                oldEndNode = oldChild[--oldEndIdx];
                newEndNode = newChild[--newEndNode];
            }
        }




    }
    // 更新类名，style, 其他attr, 都是一样的
    updateClass (el, newNode) {
        let className = '';
        el.className = '';
        if (newNode.data && newNode.data.class) {
            Object.keys(newNode.data.class).forEach((item) => {
                if (newNode.data.class[item]) {
                    className += item + ' '; // 类名之间要有空格
                }
            });
            el.className = className;
        }
    }
    // 更新事件
    updateEvent (el, oldNode, newNode) {
        let oldEvents = oldNode && oldNode.data && oldNode.data.event ? oldNode.data.event : {};
        let newEvents = newNode.data && newNode.data.event || {};
        // 把旧的不需要的event删除
        Object.keys(oldEvents).forEach((item) => {
            if (newEvents[item] === undefined || oldEvents[item] !== newEvents[item]) {
                // 删除
                el.removeEventListener(item, oldEvents[item]);
            }
        });
        // 添加新的新增的event
        Object.keys(newEvents).forEach((item) => {
            if (oldEvents[item] === undefined || oldEvents[item] !== newEvents[item]) {
                // 删除
                el.addEventListener(item, newEvents[item]);
            }
        });
    }
    // 移除VNode对应DOM上的所有事件
    removeEvent (oldNode) {
        if (oldNode && oldNode.data && oldNode.data.event) {
            const events = oldNode.data.event;
            Object.keys(events).forEach((item) => {
                oldNode.el.removeEventListener(item, events[item]);
            });
        }
    }
}
export default Patch;
