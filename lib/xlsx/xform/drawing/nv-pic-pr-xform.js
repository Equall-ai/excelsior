const BaseXform = require('../base-xform');
const CNvPrXform = require('./c-nv-pr-xform');
const CNvPicPrXform = require('./c-nv-pic-pr-xform');

// Helper to strip namespace prefix (e.g., 'xdr:nvPicPr' -> 'nvPicPr')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class NvPicPrXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'xdr:cNvPr': new CNvPrXform(),
      'xdr:cNvPicPr': new CNvPicPrXform(),
    };
  }

  get tag() {
    return 'xdr:nvPicPr';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);
    this.map['xdr:cNvPr'].render(xmlStream, model);
    this.map['xdr:cNvPicPr'].render(xmlStream, model);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'nvPicPr':
        this.reset();
        break;
      default:
        // Try with stripped namespace first, then with full namespace
        this.parser = this.map[cleanName] || this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'nvPicPr':
        this.model = this.map['xdr:cNvPr'].model;
        return false;
      default:
        return true;
    }
  }
}

module.exports = NvPicPrXform;
