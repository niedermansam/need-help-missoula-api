'use strict'

const Airtable = require("airtable");
const airBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  "appZYx8yOoxvAISJG"
);

const organizationAirbaseId = 'tblPfMrydlkmbh8u2';

const errorMessage =  'Sorry, something went wrong. Please try again.';


const organizationCacheNames = {
  loaded: 'organizationData',
  array: 'organizationArray',
  object: 'organizationObject',
}

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (req, res) {


    const {output} = req.query;

    let lookupOrgs = {};
    let orgsArray = [];

    let queryResponse = errorMessage

    if (fastify.cache().has(organizationCacheNames.loaded)) {
      
      if (output === 'lookup')  queryResponse = fastify.cache().get(organizationCacheNames.object)
      else queryResponse = fastify.cache().get(organizationCacheNames.array)

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
          
          lookupOrgs[currentRecord.id] = currentRecord;
          orgsArray.push(currentRecord)
        });

        fastify.cache().set(organizationCacheNames.object, lookupOrgs);
        fastify.cache().set(organizationCacheNames.array, orgsArray);
        fastify.cache().set(organizationCacheNames.loaded, true);
        
      }, function done(err) {
        if (err) { console.error(err); return; }
        queryResponse = output == 'lookup' ? lookupOrgs : orgsArray;
      });
    }


    res.send(queryResponse);

  });
}
