const colCache = require('../../../utils/col-cache');
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const TwoCellAnchorXform = require('./two-cell-anchor-xform');
const OneCellAnchorXform = require('./one-cell-anchor-xform');

// Helper to strip namespace prefix (e.g., 'xdr:twoCellAnchor' -> 'twoCellAnchor')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

function getAnchorType(model) {
  const range = typeof model.range === 'string' ? colCache.decode(model.range) : model.range;

  return range.br ? 'xdr:twoCellAnchor' : 'xdr:oneCellAnchor';
}

class DrawingXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'xdr:twoCellAnchor': new TwoCellAnchorXform(),
      'xdr:oneCellAnchor': new OneCellAnchorXform(),
    };
  }

  prepare(model) {
    if (model.anchors) {
      model.anchors.forEach((item, index) => {
        item.anchorType = getAnchorType(item);
        const anchor = this.map[item.anchorType];
        anchor.prepare(item, {index});
      });
    }
  }

  get tag() {
    return 'xdr:wsDr';
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, DrawingXform.DRAWING_ATTRIBUTES);

    if (model.anchors) {
      model.anchors.forEach(item => {
        const anchor = this.map[item.anchorType];
        anchor.render(xmlStream, item);
      });
    }

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'wsDr':
        this.reset();
        this.model = {
          anchors: [],
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

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.anchors.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'wsDr':
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    if (model.anchors) {
      model.anchors.forEach(anchor => {
        if (anchor.br) {
          this.map['xdr:twoCellAnchor'].reconcile(anchor, options);
        } else {
          this.map['xdr:oneCellAnchor'].reconcile(anchor, options);
        }
      });
    }
  }
}

DrawingXform.DRAWING_ATTRIBUTES = {
  'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
  'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
};

module.exports = DrawingXform;
