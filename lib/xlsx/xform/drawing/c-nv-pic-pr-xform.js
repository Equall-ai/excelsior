const BaseXform = require('../base-xform');

// Helper to strip namespace prefix (e.g., 'xdr:cNvPicPr' -> 'cNvPicPr')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class CNvPicPrXform extends BaseXform {
  get tag() {
    return 'xdr:cNvPicPr';
  }

  render(xmlStream) {
    xmlStream.openNode(this.tag);
    xmlStream.leafNode('a:picLocks', {
      noChangeAspect: '1',
    });
    xmlStream.closeNode();
  }

  parseOpen(node) {
    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'cNvPicPr':
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'cNvPicPr':
        return false;
      default:
        // unprocessed internal nodes
        return true;
    }
  }
}

module.exports = CNvPicPrXform;
