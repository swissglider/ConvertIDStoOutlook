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
            var outlookContacts = [];
            for(var i=0; i<this.idsEntries.length; i++){
                this.convertRows(this.idsEntries);
                if(!this.idsEntries[i].NotExport){
                    var tmpCont = {};
                    for (var x in this.config.MAPPING_TABLE) {
                        if(x == "Kategorien")
                            tmpCont[x] = this.config.MAPPING_TABLE[x];
                        else if(x == "Notizen")
                            tmpCont[x] = this.config.MAPPING_TABLE[x];
                        else{
                            tmpCont[x] = this.idsEntries[i][this.config.MAPPING_TABLE[x]];
                        }
                    }
                    outlookContacts.push(tmpCont);
                }
            }
            resolve(outlookContacts);
        }.bind(this))
}

IDS_Parser.prototype.convertRows = function(idsEntry) {
    // itarate throws all the converters

    // correct the error with IDS Entries that on the JobCode Row has an error
    if(idsEntry.undefined){
        this.correctErrorWithAmountofRows(idsEntry);
    }

    // if not CompanyName --> idsEntry.NotExport = true
    this.checkCompanyName(idsEntry);

    // if not OfficeCity --> idsEntry.NotExport = true
    this.checkOfficeCity(idsEntry);

    // format number to country number format
    this.getCountryNumber(idsEntry);

    // checks if mobile numbers exists, and if yes if it is on the CellPhoneNumber row.
    // if two exists --> checks if they are the same --> if so, they only need to have the CellPhoneNumber, the other will be deleted
    this.checkMobilePhone(idsEntry);

    // delete all Main Numbers
    this.deleteAllMainNumbers(idsEntry);

    // if no number available --> idsEntry.NotExport = true
    this.checkIfNumberAvailable(idsEntry);

}

// correct the error with IDS Entries that on the 'rowNameOfError' Row has an error
IDS_Parser.prototype.correctErrorWithAmountOfRows = function(idsEntry){
    if(idsEntry.NotExport)
        return;
    var rowNameOfError = 'JobCode';
    var indexToShift = '';
    var readyToShift = false;
    for (var x in idsEntry) {
        if(readyToShift){
            idsEntry[indexToShift] = idsEntry[x];
        }

        if(x == rowNameOfError)
            readyToShift = true;
        indexToShift = x;
    }
}

// if not CompanyName --> idsEntry.NotExport = true
IDS_Parser.prototype.checkCompanyName = function(idsEntry){
    if(idsEntry.NotExport)
        return;
}

// if not OfficeCity --> idsEntry.NotExport = true
IDS_Parser.prototype.checkOfficeCity = function(idsEntry){
    if(idsEntry.NotExport)
        return;
}

// delete all Main Numbers
IDS_Parser.prototype.deleteAllMainNumbers = function(idsEntry){
    if(idsEntry.NotExport)
        return;
}

// if no number available --> idsEntry.NotExport = true
IDS_Parser.prototype.checkIfNumberAvailable = function(idsEntry){
    if(idsEntry.NotExport)
        return;
}

// format number to country number format
IDS_Parser.prototype.getCountryNumber = function(idsEntry){
    if(idsEntry.NotExport)
        return;
}

// checks if mobile numbers exists, and if yes if it is on the CellPhoneNumber row.
// if two exists --> checks if they are the same
// --> if so, they only need to have the CellPhoneNumber, the other will be deleted
IDS_Parser.prototype.checkMobilePhone = function(idsEntry){
    if(idsEntry.NotExport)
        return;
}


module.exports = IDS_Parser;
