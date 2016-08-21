var Converter = require('./CVSToOutlookConverter');
var config = require('./configFiles/main.json');

var converter = new Converter(config);

converter.startConvert();
converter.parse();
converter.mapRows();
converter.convert();
converter.filterRows();
converter.save();
