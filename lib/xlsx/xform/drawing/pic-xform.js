const BaseXform = require('../base-xform');
const StaticXform = require('../static-xform');

const BlipFillXform = require('./blip-fill-xform');
const NvPicPrXform = require('./nv-pic-pr-xform');

const spPrJSON = require('./sp-pr');

// Helper to strip namespace prefix (e.g., 'xdr:pic' -> 'pic')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class PicXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'xdr:nvPicPr': new NvPicPrXform(),
      'xdr:blipFill': new BlipFillXform(),
      'xdr:spPr': new StaticXform(spPrJSON),
    };
  }

  get tag() {
    return 'xdr:pic';
  }

  prepare(model, options) {
    model.index = options.index + 1;
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    this.map['xdr:nvPicPr'].render(xmlStream, model);
    this.map['xdr:blipFill'].render(xmlStream, model);
    this.map['xdr:spPr'].render(xmlStream, model);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'pic':
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
        this.mergeModel(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'pic':
        return false;
      default:
        // not quite sure how we get here!
        return true;
    }
  }
}

module.exports = PicXform;
