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
    // parser.parse();
    return new Promise(
        function(resolve, reject) {
            fs.createReadStream(fileName).pipe(parse(options,
                (error, idsEntries) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(idsEntries);
                    }
                }
            ));
        }
    )
}

function getMapperFunction(contactArray) {
    // parser.map();
    return new Promise(
        function(resolve, reject) {
            resolve(contactArray);
        })
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
        var mappers = [];
        for (var contacts of contactArrays) {
            mappers.push(getMapperFunction(contacts));
        }
        return mappers;
    })
    .then(mappers => {
        // mapRows
        return Promise.all(mappers)
            .then(mappedContactArrays => {
                // merge all parsed and mapped contact-arrays
                return [].concat.apply([], mappedContactArrays);;
            })
    })
    .then(mappedContactArray => {
        // convert Numbers adresses etc
        // itareates over all converters
        console.dir('parser, mapped, converted = ' + mappedContactArray[0].GUID);
        return mappedContactArray;
    })
    .then(convertedContactArray => {
        // filterRows
        // itareates over all filters
        console.dir('filtered = ' + convertedContactArray[0].GUID);
        return convertedContactArray;
    })
    .then(filteredContactArray => {
        // save to new outputFile
        console.dir('saved = ' + filteredContactArray[0].GUID);
    })
    .catch(err => {
        console.log(err);
    });
