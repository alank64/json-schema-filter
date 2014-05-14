#json-schema-filter

Filters (removes) objects recursivly from document based on passed json-schema

**Note that this does NOT validate your document againts the schema, use someting like ```JSV``` npm after calling.**

For performance reasons it is assumed that the json-schema contains less items then the document, that is you are going to be removing from the document in most or all cases, if not I would recomend another solution which bases its recursive evalution on the document instead.

### Install

```bash
$ npm install json-schema-filter
```

### Usage...

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
      "general": {
        "type": "object",
        "required": false
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

// Works on nested objects and arrays as well...
document = {
	firstName: 'Johnny',
	lastName: 'Dowsky',
	contacts: [
		{phone: '303943', shouldNot: 'see this!'},
		{phone; '399494'}
	]
}
var nestedResults = filter(schema, document);

console.log(results);  // # {firstName: 'Johnny', lastName: 'Dowski', contacts: [{phone: '303943', phone: '399494'}]}


```

### Notes:

#### "object" without "properties" or free form objects

If a ```"type": "object"``` with no ```"property":``` is defined (see 'general:' in above example), or empty, the entire object is removed from the results. It could be that you require it to be included but empty, but to the best of my knowledge I thought it would be cleaner to simply remove it if empty. Else it copies everything over, as in all of what is in the properties of the key.

Backgound info: The lack of ```property``` is legal in json-schema and means anything goes, or what I refer to as free-form.. free-style.. oh well, pick your meaning for it, it has the word 'free'!
