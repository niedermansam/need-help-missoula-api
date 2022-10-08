'use strict'
const fp = require('fastify-plugin')


// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const Airtable = require("airtable");
const fastify = require("fastify");


const airbase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
.base( "appZYx8yOoxvAISJG" );

module.exports = fp(async function (fastify, opts) {


  fastify.decorate('airbase', function () {
    return airbase;
  })
})
