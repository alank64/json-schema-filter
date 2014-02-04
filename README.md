json-schema-filter
==================

Filters (removes) objects recursivly from document based on passed json-schema

Note that this does NOT validate your document againts the schema, use someting like ```JSV``` npm after calling.

For performance reasons it is assumed that the json-schema contains less items then the document, that is you are going to be removing from the document in most or all cases, if not I would recomend another solution which bases its recursive evalution on the document instead.

Usage...

```javascript

var filter = require('json-schema-filter');

var schema = {
    "title": "Example Schema",
    "type": "object",
    "properties": {
      "firstName": {
        "type": "string"
      },
      "lastName": {
        "type": "string"
      },
      "age": {
        "description": "Age in years",
        "type": "integer",
        "minimum": 0
      },
      "contacts": {
        "type": "array",
        "id": "http://jsonschema.net/contacts",
        "required": false,
        "items": {
          "type": "object",
          "id": "http://jsonschema.net/contacts/0",
          "required": false,
          "properties": {
            "phone": {
              "type": "string",
              "required": false
            }
          }
        }
      }
    },
    "required": ["firstName", "lastName"]
};

var document = {firstName: 'John', lastName: 'Dow!', shouldNot: 'see this!'};

var results = filter(schema, document);   

console.log(results);  // # {firstName: 'John', lastName: 'Dow!'}

```
