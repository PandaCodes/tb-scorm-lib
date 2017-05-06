class Node {
  constructor({ parent, value, index }) {
    this.parent = parent;
    this.index = index;
    this.value = value;
  }

  setChildren(children) {
    this.children = children;
    return this;
  }
}
const findFirstTerminal = node => (node.children ? findFirstTerminal(node.children[0]) : node);
const findLastTerminal = node => (node.children
  ? findLastTerminal(node.children[node.children.length - 1])
  : node);

export default class OrganizationTree {
  constructor(organizationTag) {
    if (!(organizationTag && organizationTag.children)) {
      throw new Error('Bad organization tag format');
    }
    const parseItemTree = (itemTag, parent, index) => {
      const node = new Node({
        value: itemTag,
        parent,
        index,
      });
      const children = [].map.call(itemTag.children || [], subTag =>
        (subTag.tagName === 'item' ? subTag : null))
      .filter(tag => tag !== null)
      .map((subItemTag, i) => parseItemTree(subItemTag, node, i));
      return children.length === 0 ? node : node.setChildren(children);
    };
    this._root = parseItemTree(organizationTag, null, 0);
    this._pointer = findFirstTerminal(this._root);
  }

  current() {
    return this._pointer.value;
  }

  next(shiftPointer = false) {
    const findNext = (node) => {
      if (!node.parent) return null;
      return node.parent.children.length === node.index + 1
        ? findNext(node.parent)
        : findFirstTerminal(node.parent.children[node.index + 1]);
    };
    const nextNode = findNext(this._pointer);
    if (shiftPointer) {
      this._pointer = nextNode || this._pointer;
    }
    return nextNode && nextNode.value;
  }

  prev(shiftPointer = false) {
    const findPrev = (node) => {
      if (!node.parent) return null;
      return node.index === 0
        ? findPrev(node.parent)
        : findLastTerminal(node.parent.children[node.index - 1]);
    };
    const prevNode = findPrev(this._pointer);
    if (shiftPointer) {
      this._pointer = prevNode || this._pointer;
    }
    return prevNode && prevNode.value;
  }

  hasNext() {
    return !!this.next();
  }

  hasPrev() {
    return !!this.prev();
  }

  shiftNext() {
    return this.next(true);
  }

  shiftPrev() {
    return this.prev(true);
  }
}
