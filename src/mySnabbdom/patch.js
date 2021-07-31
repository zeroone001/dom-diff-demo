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
    // 对比同一个虚拟节点，这是关键，要理解
    // 对新旧VNode进行比较，并且进行DOM更新
    patchVNode (oldVNode, newVNode) {
        if (oldVNode === newVNode) {
            return;
        }
    
        if (oldVNode.tag === newVNode.tag) {
            let el = newVNode.el = oldVNode.el;
            // 更新类名
            console.log('el--->', el);
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
                        this.diff(el, oldVNode.children, newVNode.children);

                    } else {
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
    
            let newEl = this.createEl(newVNode);
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
    /*
        四种命中查找
        旧前VS新前，
        旧后VS新后
        旧前VS新后 （涉及移动节点）
        旧后VS新前 （涉及移动节点）
    */
    // 目的是让旧列表变成新列表
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
        // 只要有一个循环结束，那么就结束了
        // 如果旧节点先循环完了，说明要插入新的节点
        // 如果新节点先循环结束，说明要删除旧节点
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            // 下面这四个if是跳过的操作
            if (oldStartNode === null) {
                // 前面有置为null的情况，如果遇到就跳过
                oldStartNode = oldChild[++oldStartIdx];
            } else if (oldEndNode === null) {
                oldEndNode = oldChild[--oldEndIdx];
            } else if (newStartNode === null) {
                newStartNode = newChild[++newStartIdx];
            } else if (newEndNode === null) {
                newEndNode = newChild[--newEndIdx];



            } else if (this.isSameNode(oldStartNode, newStartNode)) {
                // 旧前VS新前，
                this.patchVNode(oldStartNode, newStartNode);
                oldStartNode = oldChild[++oldStartIdx]; // 指针后移
                newStartNode = newChild[++newStartIdx]; // 指针后移

            } else if (this.isSameNode(oldEndNode, newEndNode)) {
                // 旧后VS新后
                this.patchVNode(oldEndNode, newEndNode);
                oldEndNode = oldChild[--oldEndIdx];
                newEndNode = newChild[--newEndIdx];
                
            } else if (this.isSameNode(oldStartNode, newEndNode)) {
                // 旧前VS新后
                // 移动新后的节点到旧后之后去
                this.patchVNode(oldStartNode, newEndNode);
                // 移动oldStartNode节点到oldEndNode之后
                el.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling);

                oldStartNode = oldChild[++oldStartIdx]; // 指针后移
                newEndNode = newChild[--newEndIdx]; // 指针前移动

            } else if (this.isSameNode(oldEndNode, newStartNode)) {
                // 旧后，新前
                this.patchVNode(oldEndNode, newStartNode);
                // 移动【新前】的节点到旧节点的【旧前】的前面
                el.insertBefore(oldEndNode.el, oldStartNode.el);

                oldEndNode = oldChild[--oldEndIdx]; // 指针后移
                newStartNode = newChild[++newStartIdx]; // 指针前移动
            } else {
                // 都没有找到，那么需要循环旧节点
                /*
                    再下一轮会发现四次比较都没有发现可以复用的节点，这咋办呢，
                    因为最终我们需要让旧列表变成新列表，所以当前的newStartVNode如果在旧列表里没找到可复用的，
                    需要直接创建一个新节点插进去，但是我们一眼就看到了旧节点里有c节点，只是不在此轮比较的四个位置上，
                    那么我们可以直接在旧的列表里搜索，找到了就进行patch，并且把该节点移动到当前比较区间的第一个，
                    也就是oldStartIdx之前，这个位置空下来了就置为null，
                    后续遍历到就跳过，如果没找到，那么说明这丫节点真的是新增的，直接创建该节点插入到oldStartIdx之前即可
                */


                // 循环查找新节点是否在旧节点数组里存在
                let findIndex = this.findSameNode(oldChild, newStartNode);

                if (findIndex === -1) {
                    // 如果找不到 那么就插入到 旧前节点的前面
                    el.insertBefore(this.createEl(newStartNode), oldStartNode.el);
                } else {
                    // 如果找到了， 那么就移动旧节点到 旧前节点的前面

                    let oldVNode = oldChild[findIndex];
                    this.patchVNode(oldVNode, newStartNode);
                    el.insertBefore(oldVNode.el, oldStartNode.el);

                    // 原位置置空
                    oldChild[findIndex] = null;

                }

                // 指针进行移动
                newStartNode = newChild[++newStartIdx];

            }
        } // while END

        // 旧的列表里多了节点，这两个在新列表里没有，所以需要把它们移除，
        // 反过来，如果新的列表里多了旧列表里没有的节点，那么就创建和插入之
        if (oldStartIdx <= oldEndIdx) {
            // 旧list没有遍历完成, 删除
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                oldChild[i] && el.removeChild(oldChild[i].el);
            }

        } else if (newStartIdx <= newEndIdx) {
            // 新list没有遍历完成， 插入
            for (let i = newStartIdx; i <= newEndIdx; i++) {
                el.insertBefore(this.createEl(newChild[i]), oldChild[oldStartIdx].el);
            }

        }




    }
    // 查找相同的node
    findSameNode (oldChild, newStartNode) {
        // let index = -1;
        // oldChild.forEach((item, i) => {
        //     if (this.isSameNode(item, newStartNode)) {
        //         index = i;
        //     }
        // });
        // return index;
        return oldChild.findIndex((item) => {
            return item && this.isSameNode(item, newStartNode);
        });
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
