var csv = require('ya-csv');

var reader = csv.createCsvFileReader('SWITZERLAND.csv', {
    'separator': '\t',
    'quote': '"',
    'escape': '"',
    'comment': '',
    'columnsFromHeader': true,
});
var writer = new csv.CsvWriter(process.stdout);
var rowNumber = 0;
//reader.setColumnNames([ 'col1', 'col2' ]);
reader.addListener('data', function(data) {
    //if(data.GUID == 'SESA53272'){
        //writer.writeRecord([ data]);
        console.log('-' + data.FirstName + '.' + data.LastName + ' - ' + data.OfficePhoneNumber);
    //}
    rowNumber++;
    console.log(rowNumber);

        //console.dir(data);
        //console.log(data);
    //rowNumber = false;
});
