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

async function handler(req, reply) {
  const DEFAULT_SHIPPING_COST = 1000
  const { NEW_CUSTOMER_SHIPPING_COST } = this.config
  req.log.info({ value: NEW_CUSTOMER_SHIPPING_COST }, 'NEW_CUSTOMER_SHIPPING_COST value')

  // Get query params
  const { orderId } = req.query
  req.log.info({ orderId }, 'OrderId value')

  // Get proxy for interact with the Crud Service
  const proxy = req.getDirectServiceProxy('crud-service', { protocol: 'http' })
  const orderCrudRes = await proxy.get(`/orders/${orderId}`)

  req.log.info({ stausCode: orderCrudRes.statusCode }, 'Status Code')

  if (orderCrudRes.statusCode !== 200) {
    reply.
      code(404)
      .send({
        error: 'Order does not exist',
      })
    return
  }
  const order = orderCrudRes.payload

  const customerCrudRes = await proxy.get(`/customers/${order.customerId}`)

  if (customerCrudRes.statusCode !== 200) {
    reply.
      code(404)
      .send({
        error: 'Customer does not exist',
      })
    return
  }
  const customer = customerCrudRes.payload

  const { newCustomer } = customer

  return {
    shippingCost: newCustomer ? NEW_CUSTOMER_SHIPPING_COST : DEFAULT_SHIPPING_COST,
  }
}

const schema = {
  params: {
    type: 'object',
    properties: {
      orderId: { type: 'string' },
    },
  },
  response: {
    '200': {
      type: 'object',
      properties: {
        shippingCost: { type: 'number' },
      },
    },
    '4xx': {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    '5xx': {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

module.exports = {
  handler,
  schema,
}
