const WorkbookXform = verquire('xlsx/xform/book/workbook-xform');

// This XML represents a workbook without sheets element
const workbookWithoutSheets = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303"/>
    <bookViews>
        <workbookView visibility="hidden" xWindow="0" yWindow="0" windowWidth="12000" windowHeight="24000"/>
    </bookViews>
    <!-- sheets element is missing -->
    <calcPr calcId="171027"/>
</workbook>`;

describe('WorkbookXform - undefined sheets handling', () => {
  it('should handle workbook XML without sheets element', async () => {
    const xform = new WorkbookXform();

    // Parse the XML without sheets element
    const model = await xform.parseStream(workbookWithoutSheets);

    // After the fix, sheets should be an empty array instead of undefined
    expect(model).to.exist();
    expect(model.sheets).to.be.an('array').that.is.empty();
    expect(model.views).to.be.an('array').that.has.lengthOf(1);
    expect(model.properties).to.be.an('object');
  });

  it('should safely handle operations on empty sheets array', () => {
    const xform = new WorkbookXform();

    return xform.parseStream(workbookWithoutSheets).then(model => {
      // After the fix, this should work safely
      const testAccess = () => {
        const newModel = {};
        newModel.sheets = model.sheets; // This assigns an empty array

        // These operations should now work safely
        expect(model.sheets.length).to.equal(0);

        // Array methods work on empty arrays
        const processSheets = sheets => {
          return sheets.map(sheet => sheet.name);
        };

        // This should return an empty array instead of throwing
        const result = processSheets(model.sheets);
        expect(result).to.be.an('array').that.is.empty();

        // Other safe operations
        const names = model.sheets.filter(s => s.name).map(s => s.name);
        expect(names).to.be.an('array').that.is.empty();

        model.sheets.forEach(sheet => {
          // This won't execute since array is empty
          expect.fail('Should not have any sheets');
        });
      };

      // This should not throw anymore
      expect(testAccess).to.not.throw();
      testAccess();
    });
  });
});
