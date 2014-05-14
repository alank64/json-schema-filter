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


  it('filters the docuemnt with no exclusions', function(){

    var document = {
      firstName: 'Andrew',
      lastName: 'Lank'
    }

    var result = filter(schema, document);

    expect(result).to.eql(document);

  });

  it('excludes non schema defined objects', function(){
    var document = {
      firstName: 'Andrew',
      lastName: 'Lank',
      thisOne: 'should not appear in results',
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', lastName: 'Lank'});
  });

  it('excludes non schema defined array objects', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888', shouldNot: 'see this'}]
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: [{phone: '5146666666'}, {phone: '5148888888'}]});
  });

  it('accepts free form objects', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}],
      general: {hobbies: ['cylcing', 'jogging', 'death'], drinking_abilities: 'professional'}
    }

    var result = filter(schema, document);

    expect(result).to.eql(document);
  });

  it('accepts free form objects, if empty do not include them', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}],
      general: {}
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: [{phone: '5146666666'}, {phone: '5148888888'}]});
  });

  it('accepts free form objects that are absent', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}],
    }

    var result = filter(schema, document);

    expect(result).to.eql(document);
  });

});


