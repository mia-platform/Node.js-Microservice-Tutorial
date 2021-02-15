/*
 * Copyright 2021 Mia srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const t = require('tap')
const lc39 = require('@mia-platform/lc39')
const nock = require('nock')

const NEW_CUSTOMER_SHIPPING_COST = 5000

async function setupFastify(envVariables) {
  const fastify = await lc39('./index.js', {
    // silent => trace for enabling logs
    logLevel: 'silent',
    envVariables,
  })
  return fastify
}

t.test('get-shipping-cost', async t => {
  const fastify = await setupFastify({
    USERID_HEADER_KEY: 'userid',
    GROUPS_HEADER_KEY: 'groups',
    CLIENTTYPE_HEADER_KEY: 'clienttype',
    BACKOFFICE_HEADER_KEY: 'backoffice',
    MICROSERVICE_GATEWAY_SERVICE_NAME: 'microservice-gateway.example.org',
    NEW_CUSTOMER_SHIPPING_COST,
  })

  t.tearDown(async() => {
    await fastify.close()
  })

  t.test('GET /hello', t => {
    t.test('Correct message', async t => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/hello',
      })
      t.equal(response.statusCode, 200)
      t.same(JSON.parse(response.payload), { message: 'Hello by your first microservice' })
    })
    t.end()
  })

  t.test('GET /get-shipping-cost', t => {
    const CRUD_URL = 'http://crud-service'
    const DEFAULT_SHIPPING_COST = 1000

    t.test('New customer shipping cost', async t => {
      const orderId = '1'

      const mockedOrder = {
        customerId: '2',
      }

      const { customerId } = mockedOrder

      const mockedCustomer = {
        customerVATId: customerId,
        newCustomer: true,
      }

      const getOrderScope = nock(CRUD_URL)
        .get(`/orders/${orderId}`)
        .reply(200, mockedOrder)

      const getCustomerScope = nock(CRUD_URL)
        .get(`/customers/${customerId}`)
        .reply(200, mockedCustomer)

      const response = await fastify.inject({
        method: 'GET',
        url: '/get-shipping-cost',
        query: {
          orderId,
        },
      })
      t.equal(response.statusCode, 200)
      t.same(JSON.parse(response.payload), { shippingCost: NEW_CUSTOMER_SHIPPING_COST })
      getOrderScope.done()
      getCustomerScope.done()
    })

    t.test('Default shipping cost', async t => {
      const orderId = '1'

      const mockedOrder = {
        customerId: '2',
      }

      const { customerId } = mockedOrder

      const mockedCustomer = {
        customerVATId: customerId,
        newCustomer: false,
      }

      const getOrderScope = nock(CRUD_URL)
        .get(`/orders/${orderId}`)
        .reply(200, mockedOrder)

      const getCustomerScope = nock(CRUD_URL)
        .get(`/customers/${customerId}`)
        .reply(200, mockedCustomer)

      const response = await fastify.inject({
        method: 'GET',
        url: '/get-shipping-cost',
        query: {
          orderId,
        },
      })
      t.equal(response.statusCode, 200)
      t.same(JSON.parse(response.payload), { shippingCost: DEFAULT_SHIPPING_COST })
      getOrderScope.done()
      getCustomerScope.done()
    })

    t.test('Order does not exist', async t => {
      const orderId = '-1'

      const getOrderScope = nock(CRUD_URL)
        .get(`/orders/${orderId}`)
        .reply(404, { 'error': 'not found' })

      const response = await fastify.inject({
        method: 'GET',
        url: '/get-shipping-cost',
        query: {
          orderId,
        },
      })
      t.equal(response.statusCode, 404)
      t.same(JSON.parse(response.payload), { error: 'Order does not exist' })
      getOrderScope.done()
    })

    t.test('Customer does not exist', async t => {
      const orderId = '1'

      const mockedOrder = {
        customerId: '-1',
      }

      const { customerId } = mockedOrder

      const getOrderScope = nock(CRUD_URL)
        .get(`/orders/${orderId}`)
        .reply(200, mockedOrder)

      const getCustomerScope = nock(CRUD_URL)
        .get(`/customers/${customerId}`)
        .reply(404, { 'error': 'not found' })


      const response = await fastify.inject({
        method: 'GET',
        url: '/get-shipping-cost',
        query: {
          orderId,
        },
      })
      t.equal(response.statusCode, 404)
      t.same(JSON.parse(response.payload), { error: 'Customer does not exist' })
      getOrderScope.done()
      getCustomerScope.done()
    })

    t.end()
  })

  t.end()
})
