'use strict'
const cors = require('@fastify/cors')

const path = require('path')
const AutoLoad = require('@fastify/autoload')

const fastifyEnv = require('@fastify/env')
const envSchema = {
  type: 'object',
  required: [ 'AIRTABLE_API_KEY' ],
  properties: {
    AIRTABLE_API_KEY: {
      type: 'string'
    }
  }
}

const envOptions = {
  confKey: 'config',
  schema: envSchema,
  dotenv: true,
  data: process.env
}

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {}

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  await fastify.register(fastifyEnv, envOptions)



  await fastify.register(cors, { 
    origin: true,
    // put your options here
  })


  // not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
