'use strict'

const Airtable = require("airtable");
    
const airBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  "appZYx8yOoxvAISJG"
);

const resourceAirbaseId = 'tblzoUqKSfZudLKav';
const organizationAirbaseId = 'tblPfMrydlkmbh8u2';
const fileAirbaseId = 'tbl6bhoTJLFsQLy25';

const errorMessage =  'Sorry, something went wrong. Please try again.';

const resourceCacheNames = {
  loaded: 'resourceData',
  array: 'resourceArray',
  object: 'resourceObject',
}
const organizationCacheNames = {
    loaded: 'organizationData',
    array: 'organizationArray',
    object: 'organizationObject',
  }

  const fileCacheNames = {
    loaded: 'fileData',
    array: 'fileArray',
    object: 'fileObject',
  }

module.exports = async function (fastify, opts) {
  fastify.get("/", function (req, res) {

    const {output} = req.query;

    let lookupResources = {};
    let resourcesArray = [];
    let lookupOrgs = {};
    let orgsArray = [];
    let lookupFiles = {};
    let fileArray = [];

    let queryResponse = errorMessage
    airBase(resourceAirbaseId)
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

        fastify.cache().set(resourceCacheNames.object, lookupResources);
        fastify.cache().set(resourceCacheNames.array, resourcesArray);
        fastify.cache().set(resourceCacheNames.loaded, true);
        
        queryResponse = output == 'lookup' ? lookupResources : resourcesArray;
      });

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

      airBase(fileAirbaseId)
      .select()
      .firstPage(function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          
          let currentRecord = record.fields;
          currentRecord.id = record.id;
          
          lookupFiles[currentRecord.id] = currentRecord;
          fileArray.push(currentRecord)
        });

        fastify.cache().set(fileCacheNames.object, lookupFiles);
        fastify.cache().set(fileCacheNames.array, fileArray);
        fastify.cache().set(fileCacheNames.loaded, true);
        
        queryResponse = output == 'lookup' ? lookupFiles : fileArray;
      });

      

    return res.send("Cache updated!");
  });
}
