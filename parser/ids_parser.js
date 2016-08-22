var fs = require('fs');
var parse = require('csv').parse;

var IDS_Parser = function(configPath) {
    this.config = require(configPath);
    this.parser_options = {
        delimiter: '\t',
        quote: '"',
        escape: '"',
        comment: '',
        trim: true,
        relax: true,
        columns: true,
        relax_column_count: true
    };
    this.idsEntries = [];
}

IDS_Parser.prototype.parseCSV = function() {
    // parser.parse();
    return new Promise(
        function(resolve, reject) {
            fs.createReadStream(this.config.CVS_FILE).pipe(parse(this.parser_options,
                (error, idsEntries) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.idsEntries = idsEntries;
                        resolve(idsEntries);
                    }
                }
            ));
        }.bind(this));
}

IDS_Parser.prototype.mapRows = function() {
    return new Promise(
        function(resolve, reject) {
            resolve(this.idsEntries);
        }.bind(this))
}

module.exports = IDS_Parser;
