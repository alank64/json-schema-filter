var expect = require('chai').expect;
var filter = require('../index.js');
var resolveSchemaDependencies = require("../resolveDependencies");


describe('json-schema-filter', function () {
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
      "hobbies": {
        "type": "array",
        "required": false,
        "items": {
          "type": "string"
        }
      }
    },
    "required": ["firstName", "lastName"]
  };


  it('filters the docuemnt with no exclusions', function () {

    var document = {
      firstName: 'Andrew',
      lastName: 'Lank'
    };

    var result = filter(schema, document);

    expect(result).to.eql(document);
  });

  it('excludes non schema defined objects', function () {
    var document = {
      firstName: 'Andrew',
      lastName: 'Lank',
      age: 0,
      isLive: false,
      thisOne: 'should not appear in results'
    };

    var result = filter(schema, document);

    expect(result).to.eql({ firstName: 'Andrew', lastName: 'Lank', age: 0, isLive: false });
  });

  it('excludes non schema defined array objects', function () {
    var document = {
      firstName: 'Andrew',
      contacts: [{ phone: '5146666666' }, { phone: '5148888888', shouldNot: 'see this' }]
    };

    var result = filter(schema, document);

    expect(result).to.eql({ firstName: 'Andrew', contacts: [{ phone: '5146666666' }, { phone: '5148888888' }] });
  });

  it('accepts free form objects', function () {
    var document = {
      firstName: 'Andrew',
      contacts: [{ phone: '5146666666' }, { phone: '5148888888' }],
      general: { hobbies: ['cylcing', 'jogging', 'death'], drinking_abilities: 'professional' }
    };

    var result = filter(schema, document);

    expect(result).to.eql(document);
  });

  it('accepts free form objects, if empty do not include them', function () {
    var document = {
      firstName: 'Andrew',
      contacts: [{ phone: '5146666666' }, { phone: '5148888888' }],
      general: {}
    };

    var result = filter(schema, document);

    expect(result).to.eql({ firstName: 'Andrew', contacts: [{ phone: '5146666666' }, { phone: '5148888888' }] });
  });

  it('accepts free form objects that are absent', function () {
    var document = {
      firstName: 'Andrew',
      contacts: [{ phone: '5146666666' }, { phone: '5148888888' }]
    };

    var result = filter(schema, document);

    expect(result).to.eql(document);
  });

  it('filters array literals', function () {
    var document = {
      firstName: 'Andrew',
      contacts: [{ phone: '5146666666' }, { phone: '5148888888' }],
      hobbies: ['driving', 'working', 'working harder', 'wish I wasn\'t working']
    };

    var results = filter(schema, document);

    expect(results).to.eql(document);
  });

  it("should not remove empty string property", function () {
    var schemaForEmptyStringTest = {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "middleName": {
          "type": "string"
        }
      }
    };

    var data = {
      firstName: 'John',
      lastName: 'Dodd',
      middleName: ''
    };

    var results = filter(schemaForEmptyStringTest, data);

    expect(results).to.eql(data);
  });

  describe("should not omit null for:", function () {
    var schemaForNullTest;
    beforeEach(function () {
      schemaForNullTest = {
        "type": "object",
        "properties": {
          "firstName": {
            "type": "string"
          },
          "lastName": {
            "type": "string"
          },
          "age": {
            "type": "number"
          },
          "hometown": {
            "type": "object",
            "properties": {
              "city": {
                "type": "string"
              }
            }
          },
          "interests": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    });

    it('object', function () {
      var data = {
        firstName: 'John',
        lastName: 'Dodd',
        age: 1,
        hometown: null,
        interests: ['smile']
      };

      var results = filter(schemaForNullTest, data);
      expect(results).to.eql(data);
    });

    it('array', function () {
      var data = {
        firstName: 'John',
        lastName: 'Dodd',
        age: 2,
        hometown: {
          city: 'NYC'
        },
        interests: null
      };

      var results = filter(schemaForNullTest, data);
      expect(results).to.eql(data);
    });

    it('literals', function () {
      var data = {
        firstName: null,
        lastName: 'Dodd',
        age: null,
        hometown: {
          city: 'NYC'
        },
        interests: ['smile']
      };

      var results = filter(schemaForNullTest, data);
      expect(results).to.eql(data);
    });
  });
});

describe("The resolveSchemaDependencies function", () => {

  it("should return a flat schema with 3 properties", () => {
    const schema = {
      "type": "object",

      "properties": {
        "name": { "type": "string" },
        "credit_card": { "type": "number" }
      },

      "required": ["name"],

      "dependencies": {
        "credit_card": {
          "properties": {
            "billing_address": { "type": "string" }
          },
          "required": ["billing_address"]
        }
      }
    };

    const object = {
      "name": "John Doe",
      "credit_card": 5555555555555555,
      "billing_address": "555 Debtor's Lane"
    };

    const flatSchema = resolveSchemaDependencies(schema, object);

    expect(Object.keys(flatSchema.properties).length).to.equal(3);
    expect(flatSchema.properties).to.have.keys([
      "name",
      "credit_card",
      "billing_address"
    ]);
    console.log("the required props", flatSchema);
    expect(flatSchema.required[1]).to.equal("billing_address");
  });

  it("billing_address shouldn't be required if no credit_card is set", () => {
    const schema = {
      "type": "object",

      "properties": {
        "name": { "type": "string" },
        "credit_card": { "type": "number" }
      },

      "required": ["name"],

      "dependencies": {
        "credit_card": {
          "properties": {
            "billing_address": { "type": "string" }
          },
          "required": ["billing_address"]
        }
      }
    };

    const object = {
      "name": "John Doe",
      "billing_address": "555 Debtor's Lane"
    };

    const flatSchema = resolveSchemaDependencies(schema, object);

    expect(Object.keys(flatSchema.properties).length).to.equal(3);
    expect(flatSchema.properties).to.have.keys([
      "name",
      "credit_card",
      "billing_address"
    ]);
    expect(flatSchema.required).to.have.lengthOf(1);
    expect(flatSchema.required[0]).to.equal("name");
  });

  it("shouldn't alter the number of properties for dependencies property in format of dependentRequired", () => {

    const schema = {
      "type": "object",

      "properties": {
        "name": { "type": "string" },
        "credit_card": { "type": "number" },
        "billing_address": { "type": "string" }
      },

      "required": ["name"],

      "dependencies": {
        "credit_card": ["billing_address"]
      }
    };

    const flatSchema = resolveSchemaDependencies(schema);

    expect(Object.keys(flatSchema.properties).length).to.equal(3);

  });
});