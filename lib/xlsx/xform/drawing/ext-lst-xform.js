const BaseXform = require('../base-xform');

// Helper to strip namespace prefix (e.g., 'a:extLst' -> 'extLst')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class ExtLstXform extends BaseXform {
  get tag() {
    return 'a:extLst';
  }

  render(xmlStream) {
    xmlStream.openNode(this.tag);
    xmlStream.openNode('a:ext', {
      uri: '{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}',
    });
    xmlStream.leafNode('a16:creationId', {
      'xmlns:a16': 'http://schemas.microsoft.com/office/drawing/2014/main',
      id: '{00000000-0008-0000-0000-000002000000}',
    });
    xmlStream.closeNode();
    xmlStream.closeNode();
  }

  parseOpen(node) {
    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'extLst':
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'extLst':
        return false;
      default:
        // unprocessed internal nodes
        return true;
    }
  }
}

module.exports = ExtLstXform;
