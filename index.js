var Converter = require('./CVSToOutlookConverter');
var config = require('./configFiles/main.json');

var converter = new Converter(config);

converter.startConvert()
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.log('Error: ');
        console.dir(err);
    });
