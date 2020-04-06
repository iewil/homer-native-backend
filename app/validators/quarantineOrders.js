const createQuarantineOrdersSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        contact_number: {
          type: 'string'
        },
        start_date: {
          type: 'string',
          format: 'date'
        },
        end_date: {
          type: 'string',
          format: 'date'
        },
        photo_s3_key: {
          type: 'string'
        }
      },
      required: ['contact_number', 'start_date', 'end_date']
    }
  },
  required: ['body']
}

const getQuarantineOrdersSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        contact_number: {
          type: 'string'
        }
      },
      required: ['contact_number']
    }
  },
  required: ['params']
}

const updateQuarantineOrdersSchema = {
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
    },
    body: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          format: 'date'
        },
        end_date: {
          type: 'string',
          format: 'date'
        },
        photo_s3_key: {
          type: 'string'
        }
      }
    }
  },
  required: ['params']
}

const invalidateQuarantineOrdersSchema = {
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
  createQuarantineOrdersSchema,
  getQuarantineOrdersSchema,
  updateQuarantineOrdersSchema,
  invalidateQuarantineOrdersSchema
}