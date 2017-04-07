export default class {
  constructor(node) {
    this.node = node;
  }
  
  getCildIn(path = []) {
    if (typeof path === "string") {
      path = [path];
    }
    const currentNode = this.node;
    path.map(nodeName => {
      if(currentNode) {
        const currentListNode = currentNode.getElementsByTagName(nodeName);
        return currentNode = currentListNode ? currentListNode[0] : null;
      }
      currentNode = null;
    });
    
    return currentNode;
  }
  
  getValueIn(path) {
    const lastNode = this.getCildIn(path);
    if (lastNode) {
      const textNode = lastNode.childNodes[0];
      return textNode ? textNode.nodeValue : null;
    }
    return null;
  }
  
  getAttributeIn(path, attrName) {
    const lastNode = this.getCildIn(path);
    if (lastNode) {
      return lastNode.getAttribute(attrName);
    }
    return null;
  }
}