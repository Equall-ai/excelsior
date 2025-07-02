const ExcelJS = verquire('exceljs');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

describe('github issues', () => {
  describe('issue - undefined sheets property handling', () => {
    const testDir = path.join(__dirname, '..', 'data');
    const testFile = path.join(testDir, 'test-undefined-sheets.xlsx');

    before(async () => {
      // Create a test Excel file with missing sheets element
      const zip = new JSZip();

      // Add minimal required structure
      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
      );

      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
</Types>`
      );

      // Workbook without sheets element - this causes the issue
      zip.file(
        'xl/workbook.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr/>
  <bookViews>
    <workbookView activeTab="0"/>
  </bookViews>
  <!-- sheets element is missing -->
  <calcPr calcId="171027"/>
</workbook>`
      );

      // Create the test file
      const content = await zip.generateAsync({type: 'nodebuffer'});
      fs.writeFileSync(testFile, content);
    });

    after(() => {
      // Clean up test file
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });

    it('should handle Excel files with missing sheets element without throwing', async () => {
      const wb = new ExcelJS.Workbook();

      // This should not throw "Cannot read properties of undefined (reading 'sheets')"
      await wb.xlsx.readFile(testFile);

      // Workbook should be valid but with no worksheets
      expect(wb.worksheets).to.be.an('array');
      expect(wb.worksheets.length).to.equal(0);
    });

    it('should handle operations on workbook with no sheets', async () => {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(testFile);

      // These operations should work safely
      expect(() => {
        wb.eachSheet(worksheet => {
          // This won't execute since there are no sheets
          expect.fail('Should not have any sheets');
        });
      }).to.not.throw();

      // Can still add sheets to the workbook
      const ws = wb.addWorksheet('NewSheet');
      expect(ws).to.exist();
      expect(wb.worksheets.length).to.equal(1);
    });
  });
});
