const createLocationReportSchema = {
  type: 'object',
  properties: {
    orderId: {
      type: 'string'
    },
    body: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number'
        },
        longitude: {
          type: 'number'
        },
        metadata: {
          type: 'object'
        }
      },
      required: ['latitude', 'longitude']
    }
  },
  required: ['body', 'orderId']
}

const getLocationReportsSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string'
        }
      },
      required: ['order_id']
    }
  },
  required: ['params']
}

module.exports = { 
  getLocationReportsSchema,
  createLocationReportSchema 
}