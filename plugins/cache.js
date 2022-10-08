'use strict'

const fp = require('fastify-plugin')


const NodeCache = require('node-cache')
const cache = new NodeCache()

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
  fastify.decorate('cache', function () {
    return cache;
  })
})
