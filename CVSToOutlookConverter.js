var generate = require('csv-generate');
var stringify = require('csv-stringify');
var fs = require('fs');

var CVSToOutlookConverter = function(config) {
    this.config = config;
    this.parsers_config = config.PARSERS;
    this.parsers = [];
}

CVSToOutlookConverter.prototype.startConvert = function() {
    return Promise.all( /*parse Row */ this.getParserFunctions())
        .then(contactArrays => {
            return contactArrays;
        })
        .then(contactArrays => {
            // map Rows
            return Promise.all(this.getMapperFunctions())
                .then(mappedContactArrays => {
                    // merge all parsed and mapped contact-arrays
                    return [].concat.apply([], mappedContactArrays);;
                })
        })
        .then(contactArray => {
            // save to new outputFile
            return this.save(contactArray)
                .then(function(result) {
                    return result;
                })
        })
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

// save to new outputFile
CVSToOutlookConverter.prototype.save = function(contactArray) {
    return this.stringify(contactArray)
    .then(output => {
        return this.writeToCSV(output)
        .then(result =>{
            return result;
        })
    })
}

CVSToOutlookConverter.prototype.stringify = function(contactArray) {
    return new Promise(
        function(resolve, reject) {
            options = {
                delimiter: ',',
                quote: '"',
                escape: '"',
                header: true,
                quoted: true,
                quotedEmpty: true
            };
            stringify(contactArray, options,
                (error, output) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(output);
                    }
                })
        }.bind(this))
}

CVSToOutlookConverter.prototype.writeToCSV = function(output) {
    return new Promise(
        function(resolve, reject) {
            fs.writeFile(__dirname + '/' + this.config.OUTPUT_CVS, output,
                (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve('all ok-');
                    }
                })
        }.bind(this))
}

module.exports = CVSToOutlookConverter;
