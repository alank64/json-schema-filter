module.exports = filterObjectOnSchema;


function filterObjectOnSchema(schema, doc){

    var results;

    //console.log("DOC: ", JSON.stringify(doc, null, 2));
    //console.log("SCH: ", JSON.stringify(schema, null, 2));

    if (schema.type == 'object') {
      results = {};   // holds this levels items

      if (!schema.properties) {
        return doc;
      }

      // process properties  -  recursive
      Object.keys(schema.properties).forEach(function(key){
        if (doc[key] !== undefined){
          var sp = schema.properties[key];
          if ( sp.type == 'object'){

            // check if property-less object (free-form)
            if (sp.hasOwnProperty('properties')){
              results[key] = filterObjectOnSchema(sp, doc[key]);
            } else {
              if (Object.keys(doc[key]).length > 0){
                results[key] = doc[key];
              } else {
                results[key] = {};
              }
            }

          }else if(sp.type == 'array'){
            if (doc[key]) results[key] = filterObjectOnSchema(sp, doc[key]);
          }
          else if(sp.type == 'boolean' || sp.type == 'number' || sp.type == 'integer'){
            if(doc[key] != null && typeof doc[key] != 'undefined') results[key] = doc[key];
          }else{
            if (doc[key]) results[key] = doc[key]; 
          }
        }
      });

    }else if (schema.type == 'array'){
      // arrays can hold objects or literals
      if (schema.items.type == 'object') {
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

