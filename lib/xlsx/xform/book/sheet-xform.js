const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

// Helper to strip namespace prefix (e.g., 'x:sheet' -> 'sheet')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class WorksheetXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.leafNode('sheet', {
      sheetId: model.id,
      name: model.name,
      state: model.state,
      'r:id': model.rId,
    });
  }

  parseOpen(node) {
    const cleanName = stripNamespace(node.name);
    if (cleanName === 'sheet') {
      this.model = {
        name: utils.xmlDecode(node.attributes.name),
        id: parseInt(node.attributes.sheetId, 10),
        state: node.attributes.state,
        rId: node.attributes['r:id'],
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = WorksheetXform;
