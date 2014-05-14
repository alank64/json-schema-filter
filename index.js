module.exports = filterObjectOnSchema;


function filterObjectOnSchema(schema, doc){

    var results;

    //console.log("DOC: ", JSON.stringify(doc, null, 2));
    //console.log("SCH: ", JSON.stringify(schema, null, 2));

    if (schema.type == 'object') {
      results = {};   // holds this levels items

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
              } 
            }

          }else if(sp.type == 'array'){
            if (doc[key]) results[key] = filterObjectOnSchema(sp, doc[key]);
          }else{
            if (doc[key]) results[key] = doc[key]; 
          }
        }
      });

    }else if (schema.type == 'array'){
      results = [];
      doc.forEach(function(item){
        results.push(filterObjectOnSchema(schema.items, item)); 
      });
    }

    return results;

}

