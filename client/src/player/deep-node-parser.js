const ns = {};

export function addNamespaces(namespaces) {
  Object.assign(ns, namespaces);
}

export function getCildIn(node, path = []) {
    if (typeof path === "string") {
      path = [path];
    }
    const currentNode = node;
    path.map(nodeName => {
      if(currentNode) {
        const nsNodeName = nodeName.split(':');
        const currentListNode = nsNodeName.length > 1 
          ? currentNode.getElementsByTagNameNS(ns[nsNodeName[0]], nsNodeName[1])
          : currentNode.getElementsByTagName(nodeName);
        return currentNode = currentListNode ? currentListNode[0] : null;
      }
      currentNode = null;
    });
    
    return currentNode;
  }
  
export function  getValueIn(node, path) {
    const lastNode = getCildIn(node, path);
    if (lastNode) {
      const textNode = lastNode.childNodes[0];
      return textNode ? textNode.nodeValue : null;
    }
    return null;
  }
  
export function  getAttributeIn(node, path, attrName) {
    const lastNode = getCildIn(node,path);
    if (lastNode) {
      return lastNode.getAttribute(attrName);
    }
    return null;
  }
