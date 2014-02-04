var expect = require('chai').expect;
var filter = require('../index.js');


describe('json-schema-filter', function(){

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


  it('filters the docuemnt with no exclusions', function(){

    var document = {
      firstName: 'Andrew',
      lastName: 'Lank'
    }

    var result = filter(schema, document);

    expect(result).to.eql(document);

  });

  it('filters the document with exclusions', function(){
    var document = {
      firstName: 'Andrew',
      lastName: 'Lank',
      thisOne: 'should not appear in results',
    }

    var result = filter(schema, document);
    console.log(result);

    expect(result).to.eql({firstName: 'Andrew', lastName: 'Lank'});
  });

  it('filters arrays as well', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888', shouldNot: 'see this'}]
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: [{phone: '5146666666'}, {phone: '5148888888'}]});
  });
});


