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
                this.convertRows(this.idsEntries[i]);
                if(!this.idsEntries[i].NotExport){
                    var tmpCont = {};
                    for (var x in this.config.MAPPING_TABLE) {
                        if(x == "Kategorien")
                            tmpCont[x] = this.config.MAPPING_TABLE[x];
                        else if(x == "Notizen")
                            tmpCont[x] = this.config.MAPPING_TABLE[x];
                        else if(x == "Internet Frei/Gebucht")
                            tmpCont[x] = getNow();
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

// itarate throws all the converters
IDS_Parser.prototype.convertRows = function(idsEntry) {

    // correct the error with IDS Entries that on the JobCode Row has an error
    if(idsEntry.undefined){
        this.correctErrorWithAmountOfRows(idsEntry);
    }

    // if not CompanyName --> idsEntry.NotExport = true
    this.checkCompanyName(idsEntry);

    // if not OfficeCity --> idsEntry.NotExport = true
    this.checkOfficeCity(idsEntry);

    // format number to country number format
    this.formatToCountryNumber(idsEntry);

    // checks if mobile numbers exists, and if yes if it is on the CellPhoneNumber row.
    // if two exists --> checks if they are the same --> if so, they only need to have the CellPhoneNumber, the other will be deleted
    this.checkMobilePhone(idsEntry);

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
    if(this.config.COMPANY_NAMES.indexOf(idsEntry.CompanyName) == -1)
        idsEntry.NotExport = true;
}

// if not OfficeCity --> idsEntry.NotExport = true
IDS_Parser.prototype.checkOfficeCity = function(idsEntry){
    if(idsEntry.NotExport)
        return;
    if(this.config.OFFICE_CITY.indexOf(idsEntry.OfficeCity) == -1)
        idsEntry.NotExport = true;
    return;
}

// if no number available --> idsEntry.NotExport = true
IDS_Parser.prototype.checkIfNumberAvailable = function(idsEntry){
    if(idsEntry.NotExport)
        return;
    if(idsEntry.OfficePhoneNumber == '' && idsEntry.OfficePhoneNumberExt == '' && idsEntry.AltOfficePhoneNumber == '' && idsEntry.CellPhoneNumber == '')
        idsEntry.NotExport = true;
}

// checks if mobile numbers exists, and if yes if it is on the CellPhoneNumber row.
// if two exists --> checks if they are the same
// --> if so, they only need to have the CellPhoneNumber, the other will be deleted
IDS_Parser.prototype.checkMobilePhone = function(idsEntry){
    if(idsEntry.NotExport)
        return;
    var tmpOPN = idsEntry.OfficePhoneNumber;
    var tmpOPN_isMobile = false;
    var tmpOPNE = idsEntry.OfficePhoneNumberExt;
    var tmpOPNE_isMobile = false;
    var tmpAOPN = idsEntry.AltOfficePhoneNumber;
    var tmpAOPN_isMobile = false;
    var tmpAOPNE = idsEntry.AltOfficePhoneNumberExt;
    var tmpAOPNE = false;
    var tmpCPN = idsEntry.CellPhoneNumber;
    var tmpCPN_isMobile = false;

    if(this.isMobileNumber(tmpOPN)) tmpOPN_isMobile = true;
    if(this.isMobileNumber(tmpOPNE)) tmpOPNE_isMobile = true;
    if(this.isMobileNumber(tmpAOPN)) tmpAOPN_isMobile = true;
    if(this.isMobileNumber(tmpAOPNE)) tmpAOPNE_isMobile = true;
    if(this.isMobileNumber(tmpCPN)) tmpCPN_isMobile = true;

    if((tmpOPN != '') && ((tmpOPN_isMobile && !tmpCPN_isMobile) || (tmpOPN == tmpCPN))){
        idsEntry.CellPhoneNumber = tmpOPN;
        idsEntry.OfficePhoneNumber = '';
    }
    if((tmpOPNE != '') && ((tmpOPNE_isMobile && !tmpCPN_isMobile) || (tmpOPNE == tmpCPN))){
        idsEntry.CellPhoneNumber = tmpOPNE;
        idsEntry.OfficePhoneNumberExt = '';
    }
    if((tmpAOPN != '') && ((tmpAOPN_isMobile && !tmpCPN_isMobile) || (tmpAOPN == tmpCPN))){
        idsEntry.CellPhoneNumber = tmpAOPN;
        idsEntry.AltOfficePhoneNumber = '';
    }
    if((tmpAOPNE != '') && ((tmpAOPNE_isMobile && !tmpCPN_isMobile) || (tmpAOPNE == tmpCPN))){
        idsEntry.CellPhoneNumber = tmpAOPNE;
        idsEntry.AltOfficePhoneNumberExt = '';
    }
}

// checks if Swiss mobile
IDS_Parser.prototype.isMobileNumber = function(number){
    var mobileNumbers = this.config.COUNTRY_MOBILE_NUMBERS;
    var isMobile = false;
    for(var i=0; i<mobileNumbers; i++){
        if(number.startsWith(mobileNumbers[i]))
            isMobile = true;
    }
    return isMobile;
}

// format number to country number format
IDS_Parser.prototype.formatToCountryNumber = function(idsEntry){
    if(idsEntry.NotExport)
        return;
    var numbers = [idsEntry.OfficePhoneNumber, idsEntry.OfficePhoneNumberExt, idsEntry.AltOfficePhoneNumber,
                    idsEntry.AltOfficePhoneNumberExt, idsEntry.CellPhoneNumber];

    // convert numbers to country format and delete site main number
    siteNumberPrefix = this.config.SITE_NUMBER_PREFIXES[idsEntry.OfficeCity];
    idsEntry.OfficePhoneNumber = this.getFormatedCountryName(idsEntry.OfficePhoneNumber, siteNumberPrefix);
    idsEntry.OfficePhoneNumberExt = this.getFormatedCountryName(idsEntry.OfficePhoneNumberExt, siteNumberPrefix);
    idsEntry.AltOfficePhoneNumber = this.getFormatedCountryName(idsEntry.AltOfficePhoneNumber, siteNumberPrefix);
    idsEntry.CellPhoneNumber = this.getFormatedCountryName(idsEntry.CellPhoneNumber, siteNumberPrefix);
}

// convert numbers to country format and delete site main number
IDS_Parser.prototype.getFormatedCountryName = function(phoneNumber, siteNumberPrefix){
    // check if the phoneNumber is valide
    if(phoneNumber == null ||
            phoneNumber == '' ||
            phoneNumber == 'NONE' ||
            phoneNumber == 'None' ||
            phoneNumber == 0){
        return '';
    }
    // get the qualified Number
    else{
        // delete all chars
        phoneNumber = phoneNumber.replace(/[^a-z0-9]/gi, '');
        phoneNumber = parseFloat(phoneNumber).toString();
        // categorize the phoneNumber
        var numberRest2 = phoneNumber.substr(-2, 2);
        var numberRest1 = phoneNumber.substr(-4, 2);
        var numberVillage = phoneNumber.substr(-7, 3);
        var numberKanton = phoneNumber.substr(-9, 2);
        var numberCountry = siteNumberPrefix.country;
        // check if only short Number
        if (phoneNumber.length < 5) {
            // old 3 digit shortnumber will no longer be accepted
            if(phoneNumber.length < 4)
                return '';
            if(typeof siteNumberPrefix === 'undefined'){
                return '';
            }
            numberKanton = siteNumberPrefix.kanton;
            numberVillage = siteNumberPrefix.village;
        }
        phoneNumber = numberCountry + ' ' + numberKanton + ' '
                + numberVillage + ' ' + numberRest1 + ' ' + numberRest2;

        // checks if it is a site main Number, if yes delete it
        if(this.config.SITE_MAIN_NUMBER.indexOf(phoneNumber)!=-1)
            phoneNumber = '';
        return phoneNumber;
    }
}

var getNow = function() {
    return new Date().toLocaleString('de-CH', {
        hour12: false
    });
}


module.exports = IDS_Parser;
