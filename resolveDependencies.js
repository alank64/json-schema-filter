module.exports = resolveSchemaDependencies;


function resolveSchemaDependencies(schema, doc) {

  const dependencies = schema.dependentSchemas || schema.dependencies;

  const flatSchema = Object.create(schema);

  if (dependencies) {

    Object.keys(dependencies).forEach(dep => {

      if (dependencies[dep].oneOf) {

        dependencies[dep].oneOf.forEach(subschema => {

          let propertyExists = false;

          if (doc) {
            const dependencyInObject = doc[dep];
            const depValue = subschema.properties[dep].enum[0];
            if (dependencyInObject !== depValue) return;
            propertyExists = true;
          }

          Object.keys(subschema.properties).forEach(key => {
            if (key !== dep) {
              flatSchema.properties[key] = subschema.properties[key];

              const isRequired = subschema.required && subschema.required.length && subschema.required.includes(key)
              if (propertyExists && isRequired) {
                if (!flatSchema.required) flatSchema.required = [];
                if (flatSchema.required.includes(key)) return;
                flatSchema.required.push(key);
              }
            }
          })
        })
      } else {
        if (!dependencies[dep].properties) return;

        Object.keys(dependencies[dep].properties).forEach(key => {
          const isRequired = dependencies[dep].required && dependencies[dep].required.length && dependencies[dep].required.includes(key);


          flatSchema.properties[key] = dependencies[dep].properties[key];

          if (isRequired && doc) {
            const dependencyInObject = doc[dep];
            if (dependencyInObject === undefined) return;

            if (!flatSchema.required) flatSchema.required = [];
            if (flatSchema.required.includes(key)) return;
            flatSchema.required.push(key);
          }
        })
      }
    })

  };

  return flatSchema;
};