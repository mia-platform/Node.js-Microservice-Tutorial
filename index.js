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
/* eslint require-await: 0 */
'use strict'

const customService = require('@mia-platform/custom-plugin-lib')({
  type: 'object',
  required: ['NEW_CUSTOMER_SHIPPING_COST'],
  properties: {
    'NEW_CUSTOMER_SHIPPING_COST': { type: 'number' },
  },
})

const hello = require('./handlers/hello')
const getShippingCost = require('./handlers/getShippingCost')

module.exports = customService(async function index(service) {
  service.addRawCustomPlugin('GET', '/hello', hello.handler, hello.schema)
  service.addRawCustomPlugin('GET', '/get-shipping-cost', getShippingCost.handler, getShippingCost.schema)
})
