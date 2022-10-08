'use strict'

const Airtable = require("airtable");
const airBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  "appZYx8yOoxvAISJG"
);

const organizationAirbaseId = 'tblPfMrydlkmbh8u2';

const errorMessage =  'Sorry, something went wrong. Please try again.';


const cacheNames = {
  loaded: 'organizationData',
  array: 'organizationArray',
  object: 'organizationObject',
}

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (req, res) {


    const {output} = req.query;

    let lookupResources = {};
    let resourcesArray = [];

    let queryResponse = errorMessage

    if (fastify.cache().has(cacheNames.loaded)) {
      
      if (output === 'lookup')  queryResponse = fastify.cache().get(cacheNames.object)
      else queryResponse = fastify.cache().get(cacheNames.array)

    } else {
      
     airBase(organizationAirbaseId)
      .select()
      .firstPage(function (err, records) {
        if (err) {
          console.error(err);
          return;
        }

        records.forEach(function (record) {
          
          let currentRecord = record.fields;
          currentRecord.id = record.id;
          
          lookupResources[currentRecord.id] = currentRecord;
          resourcesArray.push(currentRecord)
        });

        fastify.cache().set(cacheNames.object, lookupResources);
        fastify.cache().set(cacheNames.array, resourcesArray);
        fastify.cache().set(cacheNames.loaded, true);
        
      }, function done(err) {
        if (err) { console.error(err); return; }
        queryResponse = output == 'lookup' ? lookupResources : resourcesArray;
      });
    }


    res.send(queryResponse);

  });
}
