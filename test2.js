var fs = require('fs');
var parse = require('csv').parse;

var siteNumberPrefixes = {
    Horgen:{country: '+41',kanton: '44',village: '728'},
    Ittigen:{country: '+41',kanton: '31',village: '917'},
    Wettingen:{country: '+41',kanton: '56',village: '437'},
    Oberentfelden:{country: '+41',kanton: '62',village: '737'},
    Renens:{country: '+41',kanton: '21',village: '654'},
    Rorschacherberg:{country: '+41',kanton: '71',village: '858'},
}

var companyNames = ['Gutor Electronic LLC', 'Feller', 'Schneider Electric Switzerland'];

var siteMainNumbers = ['+41 44 728 77 77', '+41 44 728 72 72',
                        '+41 31 917 33 33', '+41 62 737 32 32',
                        '+41 21 654 07 00', '+41 71 855 75 75',
                        '+41 56 437 34 34']

var parseOfficeNumber = function(number, countryCode) {
    console.log(number);
}

// correct the error with IDS Entries that on the 'rowNameOfError' Row has an error
var correctErrorWithAmountofRows = function(idsEntry, rowNameOfError){
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

// returns a fully qualified CH number
var getQualifiedSwissTelefonNumber = function(unqualifiedNumber, siteNumberPrefix){
    // delete all chars
    var number = unqualifiedNumber.replace(/[^a-z0-9]/gi, '');
    number = parseFloat(number).toString();
    // categorize the number
    var numberRest2 = number.substr(-2, 2);
    var numberRest1 = number.substr(-4, 2);
    var numberVillage = number.substr(-7, 3);
    var numberKanton = number.substr(-9, 2);
    var numberCountry = '';
    // check if only short Number
    if (number.length < 5) {
        // old 3 digit shortnumber will no longer be accepted
        if(number.length < 4)
            return '';
        if(typeof siteNumberPrefix === 'undefined'){
            return '';
        }
        numberKanton = siteNumberPrefix.kanton;
        numberVillage = siteNumberPrefix.village;
    }
    return '+41 ' + numberKanton + ' ' + numberVillage + ' ' + numberRest1 + ' ' + numberRest2;
}

//formates number to Swiss telefonNumber
var getSwissTelefonnumber = function(phoneNumber, officeCity){
    // check if the number is valide
    if(phoneNumber == null ||
            phoneNumber == '' ||
            phoneNumber == 'NONE' ||
            phoneNumber == 'None' ||
            phoneNumber == 0){
        return '';
    }
    // get the qualified Number
    var qualifiedNumber = getQualifiedSwissTelefonNumber(phoneNumber, siteNumberPrefixes[officeCity]);
    // checks if it is a main Number, if yes delete it
    if(siteMainNumbers.indexOf(qualifiedNumber)!=-1)
        qualifiedNumber = '';
    return qualifiedNumber;
}

// checks if Swiss mobile
var isSwissMobile = function(number){
    return number.startsWith('+41 76') || number.startsWith('+41 78') ||
            number.startsWith('+41 79') || number.startsWith('+41 77');
}

// checks if mobile numbers exists, and if yes if it is on the CellPhoneNumber row.
// if two exists --> checks if they are the same
// --> if so, thy only need to have the CellPhoneNumber, the other will be deleted
var checkMobilePhone = function(idsEntry){
    var tmpOPN = idsEntry.OfficePhoneNumber;
    var tmpOPN_isMobile = false;
    var tmpOPNE = idsEntry.OfficePhoneNumberExt;
    var tmpOPNE_isMobile = false;
    var tmpAOPN = idsEntry.AltOfficePhoneNumber;
    var tmpAOPN_isMobile = false;
    var tmpAOPNE = idsEntry.AltOfficePhoneNumberExt;
    var tmpAOPNE_isMobile = false;
    var tmpCPN = idsEntry.CellPhoneNumber;
    var tmpCPN_isMobile = false;

    if(isSwissMobile(tmpOPN)) tmpOPN_isMobile = true;
    if(isSwissMobile(tmpOPNE)) tmpOPNE_isMobile = true;
    if(isSwissMobile(tmpAOPN)) tmpAOPN_isMobile = true;
    if(isSwissMobile(tmpAOPNE)) tmpAOPNE_isMobile = true;
    if(isSwissMobile(tmpCPN)) tmpCPN_isMobile = true;

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

var parser = parse({
    delimiter: '\t',
    quote: '"',
    escape: '"',
    comment: '',
    trim: true,
    relax: true,
    columns: true,
    relax_column_count: true
}, function(err, idsEntries) {
    for (var i = 0; i < idsEntries.length; i++) {
        // correct the error with IDS Entries that on the JobCode Row has an error
        if(idsEntries[i].undefined){
            correctErrorWithAmountofRows(idsEntries[i], 'JobCode')
        }

        // check if swiss OfficeCity --> set NotExport to true
        if(typeof siteNumberPrefixes[idsEntries[i].OfficeCity] === 'undefined'){
            if(companyNames.indexOf(idsEntries[i].CompanyName) == -1 && idsEntries[i].OfficeCountry != 'SWITZERLAND')
                idsEntries[i].NotExport = true;
        }

        // format OfficePhoneNumber to swiss number format
        var number = getSwissTelefonnumber(idsEntries[i].OfficePhoneNumber, idsEntries[i].OfficeCity);
        idsEntries[i].OfficePhoneNumber = number;

        // format OfficePhoneNumberExt to swiss number format
        var number = getSwissTelefonnumber(idsEntries[i].OfficePhoneNumberExt, idsEntries[i].OfficeCity);
        idsEntries[i].OfficePhoneNumberExt = number;

        // format AltOfficePhoneNumber to swiss number format
        var number = getSwissTelefonnumber(idsEntries[i].AltOfficePhoneNumber, idsEntries[i].OfficeCity);
        idsEntries[i].AltOfficePhoneNumber = number;

        // format AltOfficePhoneNumberExt to swiss number format
        var number = getSwissTelefonnumber(idsEntries[i].AltOfficePhoneNumberExt, idsEntries[i].OfficeCity);
        idsEntries[i].AltOfficePhoneNumberExt = number;

        // format CellPhoneNumber to swiss number format
        var number = getSwissTelefonnumber(idsEntries[i].CellPhoneNumber, idsEntries[i].OfficeCity);
        idsEntries[i].CellPhoneNumber = number;

        // checks if mobile numbers exists, and if yes if it is on the CellPhoneNumber row.
        // if two exists --> checks if they are the same --> if so, thy only need to have the CellPhoneNumber, the other will be deleted
        checkMobilePhone(idsEntries[i]);

        // checks if there is a phone number --> if not set to NotExport
        if(idsEntries[i].OfficePhoneNumber == '' &&
                idsEntries[i].OfficePhoneNumberExt == '' &&
                idsEntries[i].AltOfficePhoneNumber == '' &&
                idsEntries[i].AltOfficePhoneNumberExt == '' &&
                idsEntries[i].CellPhoneNumber == '')
            idsEntries[i].NotExport = true;

        if(idsEntries[i].NotExport)
            console.log(idsEntries[i].GUID + ' - ' + idsEntries[i].FirstName + '.' + idsEntries[i].LastName);

    }
});

fs.createReadStream(__dirname + '/SWITZERLAND.csv_org').pipe(parser);
