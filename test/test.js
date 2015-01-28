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
      "isLive": {
        "description": "Live or dead",
        "type": "boolean"
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
      },
      "hobbies":{
        "type": "array",
        "required": false,
        "items": {
          "type": "string"
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
      age: 0,
      isLive: false,
      thisOne: 'should not appear in results'
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', lastName: 'Lank', age: 0, isLive: false});
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

  it('accepts free form objects, still include empty object', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}],
      general: {}
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: [{phone: '5146666666'}, {phone: '5148888888'}], general: {}});
  });

  it('accepts free form objects that are absent', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}]
    }

    var result = filter(schema, document)

    expect(result).to.eql(document)
  });
  it('filters array literals', function(){
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}],
      hobbies: ['driving', 'working', 'working harder', 'wish I wasn\'t working']
    }

    var results = filter(schema, document)

    expect(results).to.eql(document)

  });

  it('ignores non-objects when expecting objects', function() {
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, {phone: '5148888888'}],
      general: null
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: [{phone: '5146666666'}, {phone: '5148888888'}], general: null});
  });

  it('ignores non-objects when expecting objects', function() {
    var document = {
      firstName: 'Andrew',
      contacts: [{phone: '5146666666'}, NaN],
      general: null
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: [{phone: '5146666666'}, NaN], general: null});
  });

  it('ignores non-arrays when expecting arrays', function() {
    var document = {
      firstName: 'Andrew',
      contacts: 123
    }

    var result = filter(schema, document);

    expect(result).to.eql({firstName: 'Andrew', contacts: 123});
  });

});


