module.exports = filterObjectOnSchema;


function isObject(obj) {
    return obj === Object(obj);
}

function getType(typeThing) {
    if (!Array.isArray(typeThing)) {
        return typeThing;
    }

    // the type is an array of types instead
    // grab the first non-null type as validator (e.g. ['object', 'null'])
    var typeArray = typeThing;
    for (var i = 0; i < typeArray.length; i++) {
        var type = typeArray[i];
        if (type !== 'null') {
            return type;
        }
    }
}

function filterObjectOnSchema(schema, doc){

    var results;
    var type;

    //console.log("DOC: ", JSON.stringify(doc, null, 2));
    //console.log("SCH: ", JSON.stringify(schema, null, 2));

    type = getType(schema.type);
    if (type === 'object') {
      results = {};   // holds this levels items

      if (!schema.properties) {
        return doc;
      }

      if (!isObject(doc)) {
        return doc;
      }

      // process properties  -  recursive
      Object.keys(schema.properties).forEach(function(key){
        if (doc[key] !== undefined){
          var sp = schema.properties[key];
          type = getType(sp.type);
          if ( type === 'object'){

            // check if property-less object (free-form)
            if (sp.hasOwnProperty('properties')){
              results[key] = filterObjectOnSchema(sp, doc[key]);
            } else {
              if (!isObject(doc[key])) {
                results[key] = doc[key];
              } else if (Object.keys(doc[key]).length > 0){
                results[key] = doc[key];
              } else {
                results[key] = {};
              }
            }

          }else if(type === 'array'){
            if (doc[key]) results[key] = filterObjectOnSchema(sp, doc[key]);
          }
          else if(type === 'boolean' || type === 'number' || type === 'integer'){
            if(doc[key] != null && typeof doc[key] != 'undefined') results[key] = doc[key];
          }else{
            if (doc[key] !== undefined && doc[key] !== null) results[key] = doc[key];
          }
        }
      });

    } else if (type === 'array'){
      // arrays can hold objects or literals
      if (schema.items.type === 'object' && Array.isArray(doc)) {
        results = [];
        doc.forEach(function (item) {
          results.push(filterObjectOnSchema(schema.items, item));
        });
      } else {
        results = doc;
      }
    }

    return results;

}

