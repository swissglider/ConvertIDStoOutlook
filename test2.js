var fs = require('fs');
var parse = require('csv').parse;

var parseOfficeNumber = function(number, countryCode) {
    console.log(number);
}

var parser = parse({
    delimiter: '\t',
    quote: '"',
    escape: '"',
    comment: '',
    trim: true,
    relax_column_count: true,
    columns: true,
    relax: true
}, function(err, data) {
    // console.log('Data: ');
    // console.dir(data.length);
    // console.dir(data[212].GUID);
    // var arrayFound = data.filter(function(e1) {
    //    return e1.GUID == "SESA93561";
    // });
    // arrayFound[0].GUID = 'GGGG';
    // console.dir(data[212].GUID);
    // parseOfficeNumber(arrayFound[0].OfficePhoneNumber, arrayFound[0].OfficeCountryPhoneCode)
    // console.dir(arrayFound);
    // console.dir('-----------------');
    // console.error('Error: ' + err);
    // console.dir('--------1---------');
    var entriesWithOfficeNumber = data.filter(function(e){
      return e.OfficePhoneNumber != null && e.OfficePhoneNumber !='';
  });
    //console.log(entriesWithOfficeNumber[0]);
    for(var i=0; i<entriesWithOfficeNumber.length; i++){
      var number = entriesWithOfficeNumber[i].OfficePhoneNumber.replace(/[^a-z0-9]/gi,'');
      number = parseFloat(number).toString();
      if(number == 0 || number == 'NaN')
        number = '';
      var numberRest2 = number.substr(-2,2);
      var numberRest1 = number.substr(-4,2);
      var numberVillage = number.substring(-7,3);
      var numberKanton = number.substring(-9,2);
      var numberCountry = '';
      var test = number.substring(-12,3);
      if(number == '')
        console.log(entriesWithOfficeNumber[i].OfficeCity + ' ----- ' + entriesWithOfficeNumber[i].FirstName + ' ' + entriesWithOfficeNumber[i].LastName);
      else if(number.length < 5){
        console.log(entriesWithOfficeNumber[i].OfficeCity + ' -- ' + numberRest1 + ' ' + numberRest2);
      }else
        console.log('+41 ' + numberKanton + ' ' + numberVillage + ' ' + numberRest1 + ' ' + numberRest2);
      //console.log(test + " -- " + number);
      //console.log(number);
      //console.log('+41 ' + numberKanton + ' ' + numberVillage + ' ' + numberRest1 + ' ' + numberRest2);
    }

});

fs.createReadStream(__dirname + '/SWITZERLAND.csv').pipe(parser);
