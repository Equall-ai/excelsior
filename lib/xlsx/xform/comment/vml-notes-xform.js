const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const VmlShapeXform = require('./vml-shape-xform');

// Helper to strip namespace prefix (e.g., 'v:shape' -> 'shape')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

// This class is (currently) single purposed to insert the triangle
// drawing icons on commented cells
class VmlNotesXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'v:shape': new VmlShapeXform(),
    };
  }

  get tag() {
    return 'xml';
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, VmlNotesXform.DRAWING_ATTRIBUTES);

    xmlStream.openNode('o:shapelayout', {'v:ext': 'edit'});
    xmlStream.leafNode('o:idmap', {'v:ext': 'edit', data: 1});
    xmlStream.closeNode();

    xmlStream.openNode('v:shapetype', {
      id: '_x0000_t202',
      coordsize: '21600,21600',
      'o:spt': 202,
      path: 'm,l,21600r21600,l21600,xe',
    });
    xmlStream.leafNode('v:stroke', {joinstyle: 'miter'});
    xmlStream.leafNode('v:path', {gradientshapeok: 't', 'o:connecttype': 'rect'});
    xmlStream.closeNode();

    model.comments.forEach((item, index) => {
      this.map['v:shape'].render(xmlStream, item, index);
    });

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'xml':
        this.reset();
        this.model = {
          comments: [],
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
        this.model.comments.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'xml':
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    model.anchors.forEach(anchor => {
      if (anchor.br) {
        this.map['xdr:twoCellAnchor'].reconcile(anchor, options);
      } else {
        this.map['xdr:oneCellAnchor'].reconcile(anchor, options);
      }
    });
  }
}

VmlNotesXform.DRAWING_ATTRIBUTES = {
  'xmlns:v': 'urn:schemas-microsoft-com:vml',
  'xmlns:o': 'urn:schemas-microsoft-com:office:office',
  'xmlns:x': 'urn:schemas-microsoft-com:office:excel',
};

module.exports = VmlNotesXform;
