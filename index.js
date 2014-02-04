module.exports = filterObjectOnSchema;


function filterObjectOnSchema(schema, doc){

    var results;

    //console.log("DOC: ", JSON.stringify(doc, null, 2));
    //console.log("SCH: ", JSON.stringify(schema, null, 2));

    if (schema.type == 'object') {
      results = {};
      Object.keys(schema.properties).forEach(function(key){
        var sp = schema.properties[key];
        if ( sp.type == 'object'){
         results[key] = filterObjectOnSchema(sp, doc[key]);
        }else if(sp.type == 'array'){
          if (doc[key]) results[key] = filterObjectOnSchema(sp, doc[key]);
        }else{
          if (doc[key]) results[key] = doc[key]; 
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

