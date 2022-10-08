"use strict";

const Airtable = require("airtable");
const fastify = require("fastify");

const airBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  "appZYx8yOoxvAISJG"
);

module.exports = async function (fastify, opts) {
  fastify.get("/", function (req, rep) {
    rep.send('Welcome to the In Need Missoula API')
  })

  
  fastify.get("/cache", async function (req, res) {


    const {output} = req.query;

    let lookupResources = {};
    let resourcesArray = [];

    let queryResponse = 'Sorry, something went wrong.'

    if (fastify.cache().has("fileData")) {
      console.log("Retrieved value from cache !!");
      // Serve response from cache using
      // fastify.cache.get(key)
      if (output === 'lookup')  queryResponse = fastify.cache().get("fileObject")
      else return  queryResponse = fastify.cache().get("fileArray")
    } else {
      // Perform operation, since cache
      // doesn't have key
      airBase('tbl6bhoTJLFsQLy25')
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

        fastify.cache().set("fileObject", lookupResources);
        fastify.cache().set("fileArray", resourcesArray);
        fastify.cache().set("fileData", true);
        
        queryResponse = output == 'lookup' ? lookupResources : resourcesArray;
      });

      // Set value for same key, in order to
      // serve future requests efficiently
    }
    return res.send(queryResponse);



    // console.log(output)
    // rep.send(output)
  });

  fastify.get("/test2", (req, res) => {
    res.send(fastify.someSupport())
  })
  fastify.get("/test", (req, res) => {


    if (fastify.cache().has("uniqueKey")) {
      console.log("Retrieved value from cache !!");

      // Serve response from cache using
      // fastify.cache.get(key)
      res.send("Result: " + fastify.cache().get("uniqueKey"));
    } else {
      // Perform operation, since cache
      // doesn't have key
      let result = 18;

      // Set value for same key, in order to
      // serve future requests efficiently
      fastify.cache().set("uniqueKey", result);

      console.log("Value not present in cache," + " performing computation");
      res.send("Result: " + result);
    }
  });
};
