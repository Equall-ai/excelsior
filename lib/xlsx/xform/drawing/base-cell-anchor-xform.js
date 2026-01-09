const BaseXform = require('../base-xform');

// Helper to strip namespace prefix (e.g., 'xdr:twoCellAnchor' -> 'twoCellAnchor')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class BaseCellAnchorXform extends BaseXform {
  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    const cleanName = stripNamespace(node.name);
    const tagName = stripNamespace(this.tag);
    switch (cleanName) {
      case tagName:
        this.reset();
        this.model = {
          range: {
            editAs: node.attributes.editAs || 'oneCell',
          },
        };
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

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  reconcilePicture(model, options) {
    if (model && model.rId) {
      const rel = options.rels[model.rId];
      const match = rel.Target.match(/.*\/media\/(.+[.][a-zA-Z]{3,4})/);
      if (match) {
        const name = match[1];
        const mediaId = options.mediaIndex[name];
        return options.media[mediaId];
      }
    }
    return undefined;
  }
}

module.exports = BaseCellAnchorXform;
