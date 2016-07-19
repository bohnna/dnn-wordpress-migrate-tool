var fs  = require('fs'),
  async = require('async');

var dmt = {

  join: function(obj1, obj2, keyMatch, keyJoin) {
    var mainObj = this.loadJson(obj1),
        joinObj = this.loadJson(obj2);
    for (var key in mainObj) {
      for (var key2 in joinObj) {
        if (mainObj[key][keyMatch] == joinObj[key2][keyMatch]) {
          mainObj[key][keyJoin] = joinObj[key2][keyJoin]
        }
      }
    }
    // console.log(mainObj);

    fs.writeFile('test.json', JSON.stringify(mainObj, null, 2));
  },

  tags: function(fTagNames, fTagMap) {
    var tagNames = this.loadJson(fTagNames),
        tagMap = this.loadJson(fTagMap);
    var articleTags = this.combineRows(tagMap, "ArticleID", "TagID");
    var articleWithTagNames = this.replaceValues(articleTags, "tags", tagNames, "TagID", "Name");
    var articleWithJoinedTags = this.flattenKeyValues(articleWithTagNames, "tags");
    fs.writeFile('tags.json', JSON.stringify(articleWithJoinedTags, null, 2));
  },

  loadJson: function(filePath) {
    var jsonObj = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonObj);
  },

  combineRows: function(obj, uniqueCol, colToFlatten) {
    var newObj = [];

    for (var key in obj) {
      var val = obj[key];

      aID = val[uniqueCol];
      tID = val[colToFlatten];

      if (!newObj[aID]) {
        newObj[aID] = { ArticleID: aID, tags: [] };
        newObj[aID].tags.push(tID);
      } else {
        newObj[aID].tags.push(tID);
      }
    };

    var cleanObj = newObj.filter(function(r) {
      return r != undefined;
    });

    return cleanObj;
  },

  flattenKeyValues: function(obj, keyName) {
    for (var key in obj) {
      keyArray = obj[key][keyName];
      if (keyArray.constructor === Array) {
        obj[key][keyName] = keyArray.join(", ");
      }
    }
    return obj;
  },

  replaceValues: function(obj, keyFind, objSearch, objMatch, objKey) {
    for (var key in obj) {
      var keyVal = obj[key][keyFind];
      if (keyVal.constructor === Array) {
        for (var key2 in keyVal) {
          var foundValue = this.getValueFromID(objSearch, objMatch, keyVal[key2], objKey);
          if (foundValue) {
            keyVal[key2] = foundValue; 
          }
        } 
      } else {
        var foundValue = this.getValueFromID(objSearch, objMatch, keyVal, objKey);
        if (foundValue) {
          keyVal = foundValue; 
        }
      }
    }
    return obj;
  },
  getValueFromID: function(obj, keyMatch, value, keyRetrieve) {
    for (var key in obj) {
      if (obj[key][keyMatch] == value) {
        return obj[key][keyRetrieve];
        break;
      }
    }
  }
}

module.exports = dmt;
