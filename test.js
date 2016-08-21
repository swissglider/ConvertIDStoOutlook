var fs = require('fs');
var parse = require('csv').parse;

options = {
    delimiter: '\t',
    quote: '"',
    escape: '"',
    comment: '',
    trim: true,
    relax: true,
    columns: true,
    relax_column_count: true
};

// parse a CVS by the fileName
var parseCVS = function(fileName) {
    return new Promise(
        function(resolve, reject) {
            fs.createReadStream(fileName).pipe(parse(options,
                (error, idsEntries) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(idsEntries)
                    }
                }
            ));
        }
    )
}

// parseCVS(__dirname + '/SWITZERLAND.csv_org')
// .then(function (idsEntries) {
//     console.log(idsEntries[0].GUID);
//     return idsEntries;
// })
// .catch(function (error) {
//     console.error('An error occurred', error);
// });

var parsers = [
    parseCVS(__dirname + '/SWITZERLAND.csv_org'),
    parseCVS(__dirname + '/SWITZERLAND.csv')
]

Promise.all(parsers)
    .then(contactArrays => {
        var res = [];
        for(var contacts of contactArrays){
            console.log('result = ' + contacts[0].GUID);
            res.push(contacts[0].GUID);
        }
        return res;
    })
    .then(guid0 =>{
        Promise.all([
            function(){return guid0[0]+'-'}(),
            function(){return guid0[0]+'+'}(),
        ])
        .then(guids =>{
            console.dir(guids);
        })
        console.dir(guid0);
    })
    .catch(err => {
        console.log(err);
    });
