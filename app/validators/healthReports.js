const createHealthReportSchema = {
  type: 'object',
  properties: {
    orderId: {
      type: 'string'
    },
    body: {
      type: 'object',
      properties: {
        temperature: {
          type: 'number'
        },
        cough: {
          type: 'string'
        },
        sore_throat: {
          type: 'string'
        },
        runny_nose: {
          type: 'string'
        },
        shortness_of_breath: {
          type: 'string'
        },
        photo_s3_key: {
          type: 'string'
        },
        metadata: {
          type: 'string'
        }
      },
      required: ['temperature', 'cough', 'sore_throat', 'runny_nose', 'shortness_of_breath']
    }
  },
  required: ['body', 'orderId']
}

const getHealthReportsSchema = {
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
  getHealthReportsSchema,
  createHealthReportSchema 
}