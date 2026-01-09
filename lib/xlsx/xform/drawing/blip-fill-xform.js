const BaseXform = require('../base-xform');
const BlipXform = require('./blip-xform');

// Helper to strip namespace prefix (e.g., 'a:blip' -> 'blip')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class BlipFillXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'a:blip': new BlipXform(),
    };
  }

  get tag() {
    return 'xdr:blipFill';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    this.map['a:blip'].render(xmlStream, model);

    // TODO: options for this + parsing
    xmlStream.openNode('a:stretch');
    xmlStream.leafNode('a:fillRect');
    xmlStream.closeNode();

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'blipFill':
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
      case 'blipFill':
        this.model = this.map['a:blip'].model;
        return false;

      default:
        return true;
    }
  }
}

module.exports = BlipFillXform;
