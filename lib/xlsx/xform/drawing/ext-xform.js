const BaseXform = require('../base-xform');

/** https://en.wikipedia.org/wiki/Office_Open_XML_file_formats#DrawingML */
const EMU_PER_PIXEL_AT_96_DPI = 9525;

// Helper to strip namespace prefix (e.g., 'xdr:ext' -> 'ext')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class ExtXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.map = {};
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    const width = Math.floor(model.width * EMU_PER_PIXEL_AT_96_DPI);
    const height = Math.floor(model.height * EMU_PER_PIXEL_AT_96_DPI);

    xmlStream.addAttribute('cx', width);
    xmlStream.addAttribute('cy', height);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    const cleanName = stripNamespace(node.name);
    const tagName = stripNamespace(this.tag);
    if (cleanName === tagName) {
      this.model = {
        width: parseInt(node.attributes.cx || '0', 10) / EMU_PER_PIXEL_AT_96_DPI,
        height: parseInt(node.attributes.cy || '0', 10) / EMU_PER_PIXEL_AT_96_DPI,
      };
      return true;
    }
    return false;
  }

  parseText(/* text */) {}

  parseClose(/* name */) {
    return false;
  }
}

module.exports = ExtXform;
