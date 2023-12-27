const XLSX = require('xlsx');
const { unflattenObj } = require('./object.util');
  const excelBuffer2json = (buffer) => {
  const excel = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
    cellNF: false,
    cellText: false
  });
  const json = XLSX.utils.sheet_to_json(excel.Sheets[excel.SheetNames[0]]);
  return json.map(unflattenObj);
};


 const JSONToExcel = async (array, res) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(array);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const fileName = Date.now() + '.xlsx';
  // XLSX.writeFile(workbook, fileName);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
  res.end(XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));
  // res.end();
};

module.exports = { excelBuffer2json, JSONToExcel }; 