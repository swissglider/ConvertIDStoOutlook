var CVSToOutlookConverter = function(config){
  this.config = config;
  this.parsers_config = config.PARSERS;
  this.parsers = [];
  this.contacts = [];
}

CVSToOutlookConverter.prototype.startConvert = function(){

}

CVSToOutlookConverter.prototype.parse = function(){
  for(var i=0; i<this.parsers_config.length; i++){
    var Parser = require(this.parsers_config[i].PATH);
    var tmpParser = new Parser(__dirname + '/' + this.parsers_config[i].CONFIG_FILE);
    tmpParser.parseCSV();
    this.parsers.push(tmpParser);
  }
}

CVSToOutlookConverter.prototype.mapRows = function(){
  for(var i=0; i<this.parsers.length; i++){
    this.parsers[i].mapRows();
  }
}

CVSToOutlookConverter.prototype.convert = function(){
}

CVSToOutlookConverter.prototype.filterRows = function(){

}

CVSToOutlookConverter.prototype.save = function(){

}

module.exports = CVSToOutlookConverter;
