var CVSToOutlookConverter = function(config) {
    this.config = config;
    this.parsers_config = config.PARSERS;
    this.parsers = [];
    this.contacts = [];
}

CVSToOutlookConverter.prototype.startConvert = function() {
    return Promise.all(/*parse Row */this.getParserFunctions())
        .then(contactArrays => {
            console.log('Parsing done');
            return contactArrays;
        })
        .then(contactArrays => {
            // map Rows
            console.log('Mapping started');
            return Promise.all(this.getMapperFunctions())
                .then(mappedContactArrays => {
                    // merge all parsed and mapped contact-arrays
                    console.log('Mapping done');
                    return [].concat.apply([], mappedContactArrays);;
                })
        })
        .then(mappedContactArray => {
            // convert Rows
            console.log('Converting started');
            return this.convert(mappedContactArray);
        })
        .then(convertedContactArray => {
            // filter Rows
            console.log('Filtering started');
            return this.filterRows(convertedContactArray);
        })
        .then(filteredContactArray => {
            // save to new outputFile
            console.log('saving started');
            return this.save(filteredContactArray);
        })
        .catch(err => {
            console.log('Error: ');
            console.dir(err);
        });
}

CVSToOutlookConverter.prototype.getParserFunctions = function() {
    var parsFunctions = [];
    for (var i = 0; i < this.parsers_config.length; i++) {
        var Parser = require(this.parsers_config[i].PATH);
        var tmpParser = new Parser(__dirname + '/' + this.parsers_config[i].CONFIG_FILE);
        parsFunctions.push(tmpParser.parseCSV());
        this.parsers.push(tmpParser);
    }
    return parsFunctions;
}

CVSToOutlookConverter.prototype.getMapperFunctions = function() {
    var mapFunctions = [];
    for (var i = 0; i < this.parsers.length; i++) {
        mapFunctions.push(this.parsers[i].mapRows());
    }
    return mapFunctions;
}

// convert Numbers adresses etc
// itareates over all converters
CVSToOutlookConverter.prototype.convert = function(contactArray) {
    return contactArray;
}

// filterRows
// itareates over all filters
CVSToOutlookConverter.prototype.filterRows = function(contactArray) {
    return contactArray;
}

// save to new outputFile
CVSToOutlookConverter.prototype.save = function(contactArray) {
    return 'all ok';
}

module.exports = CVSToOutlookConverter;
