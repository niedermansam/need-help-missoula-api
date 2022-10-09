'use strict'

const Airtable = require("airtable");
    
const airBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  "appZYx8yOoxvAISJG"
);

const fileAirbaseId = 'tbl6bhoTJLFsQLy25';

const errorMessage =  'Sorry, something went wrong. Please try again.';


const fileCacheNames = {
  loaded: 'fileData',
  array: 'fileArray',
  object: 'fileObject',
}

module.exports = async function (fastify, opts) {
  fastify.get("/", function (req, res) {


    const {output} = req.query;

    let lookupFiles = {};
    let fileArray = [];

    let queryResponse = errorMessage

    if (fastify.cache().has(fileCacheNames.loaded)) {
      
      if (output === 'lookup')  queryResponse = fastify.cache().get(fileCacheNames.object)
      else return  queryResponse = fastify.cache().get(fileCacheNames.array)

    } else {
      
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
    }
    return res.send(queryResponse);
  });
}
