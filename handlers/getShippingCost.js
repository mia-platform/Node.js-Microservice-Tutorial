'use strict'


async function handler(req, reply) {
  const DEFAULT_SHIPPING_COST = 1000
  const { NEW_CUSTOMER_SHIPPING_COST } = this.config

  // Get query params
  const { orderId } = req.query

  // Get proxy for interact with the Crud Service
  const proxy = req.getDirectServiceProxy('crud-service', { protocol: 'http' })
  const orderCrudRes = await proxy.get(`/orders/${orderId}`)
  const order = orderCrudRes.payload

  if (!order) {
    reply.
      code(404)
      .send({
        error: 'Order does not exist',
      })
    return
  }

  const customerCrudRes = await proxy.get(`/customers/${order.customerId}`)
  const customer = customerCrudRes.payload

  if (!customer) {
    reply.
      code(404)
      .send({
        error: 'Customer does not exist',
      })
    return
  }

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
    '2xx': {
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
