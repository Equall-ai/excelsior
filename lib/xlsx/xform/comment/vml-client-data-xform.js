const BaseXform = require('../base-xform');

const VmlAnchorXform = require('./vml-anchor-xform');
const VmlProtectionXform = require('./style/vml-protection-xform');
const VmlPositionXform = require('./style/vml-position-xform');

const POSITION_TYPE = ['twoCells', 'oneCells', 'absolute'];

// Helper to strip namespace prefix (e.g., 'x:ClientData' -> 'ClientData')
const stripNamespace = name => {
  const idx = name.indexOf(':');
  return idx > 0 ? name.substring(idx + 1) : name;
};

class VmlClientDataXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'x:Anchor': new VmlAnchorXform(),
      'x:Locked': new VmlProtectionXform({tag: 'x:Locked'}),
      'x:LockText': new VmlProtectionXform({tag: 'x:LockText'}),
      'x:SizeWithCells': new VmlPositionXform({tag: 'x:SizeWithCells'}),
      'x:MoveWithCells': new VmlPositionXform({tag: 'x:MoveWithCells'}),
    };
  }

  get tag() {
    return 'x:ClientData';
  }

  render(xmlStream, model) {
    const {protection, editAs} = model.note;
    xmlStream.openNode(this.tag, {ObjectType: 'Note'});
    this.map['x:MoveWithCells'].render(xmlStream, editAs, POSITION_TYPE);
    this.map['x:SizeWithCells'].render(xmlStream, editAs, POSITION_TYPE);
    this.map['x:Anchor'].render(xmlStream, model);
    this.map['x:Locked'].render(xmlStream, protection.locked);
    xmlStream.leafNode('x:AutoFill', null, 'False');
    this.map['x:LockText'].render(xmlStream, protection.lockText);
    xmlStream.leafNode('x:Row', null, model.refAddress.row - 1);
    xmlStream.leafNode('x:Column', null, model.refAddress.col - 1);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    const cleanName = stripNamespace(node.name);
    switch (cleanName) {
      case 'ClientData':
        this.reset();
        this.model = {
          anchor: [],
          protection: {},
          editAs: '',
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
        this.parser = undefined;
      }
      return true;
    }
    const cleanName = stripNamespace(name);
    switch (cleanName) {
      case 'ClientData':
        this.normalizeModel();
        return false;
      default:
        return true;
    }
  }

  normalizeModel() {
    const position = Object.assign({}, this.map['x:MoveWithCells'].model, this.map['x:SizeWithCells'].model);
    const len = Object.keys(position).length;
    this.model.editAs = POSITION_TYPE[len];
    this.model.anchor = this.map['x:Anchor'].text;
    this.model.protection.locked = this.map['x:Locked'].text;
    this.model.protection.lockText = this.map['x:LockText'].text;
  }
}

module.exports = VmlClientDataXform;
