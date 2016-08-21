var IDS_Parser = function(configPath){
  this.config = require(configPath);
  console.log(this.config);
}

IDS_Parser.prototype.parseCSV = function(){
  console.log("Parse IDS File");
}

IDS_Parser.prototype.mapRows = function(){
  console.log("Map IDS File");
}

module.exports = IDS_Parser;
