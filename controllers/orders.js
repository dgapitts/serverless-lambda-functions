const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

const { getPizzas } = require('./pizzas');

/**
 * Create a new order and add it to the list of all orders.
 * @param {Order object} payload 
 */
const postOrders = (payload) => {
  if (!payload || !payload.pizzaId || !payload.deliveryAddress) {
    throw new Error('Invalid order. You need a pizzaId and a deliveryAddress.');
  }

  const pizza = getPizzas(payload.pizzaId);

  const order = {
    ...payload,
    pizzaId: pizza.id,
    pizzaName: pizza.name,
    status: 'pending',
    orderId: uuid(),
    timestamp: Date.now(),
  };

  return docClient.put({
    TableName: 'pizza-orders',
    Item: order,
  }).promise()
  .then((response) => {
    return response ? order : new Error('Order could not be created.');
  })
  .catch((error) => {
    throw error;
  });
};

/**
 * Get an existing order when orderId is specified, or list all orders when no orderId is given.
 * @param {string?} orderId 
 */
const getOrders = (orderId) => {
  if (orderId) {
    // Return a single order.
    return docClient.get({
      TableName: 'pizza-orders',
      Key: {
        orderId,
      },
    }).promise()
      .then((result) => {
        if (!result.Item || !result.Item.orderId) {
          throw new Error('Order cannot be found.');
        }

        return result.Item;
      })
      .catch((error) => {
        throw error;
      });
  }

  // Return all orders.
  return docClient.scan({
    TableName: 'pizza-orders',
  }).promise()
  .then((result) => {
    if (result.Count === 0) {
      throw new Error('There are no orders in the database.');
    }

    return result.Items;
  })
  .catch((error) => {
    throw error;
  });
};

/**
 * Update an existing order.
 * @param {string} orderId
 * @param {Order object} payload
 */
const putOrders = (orderId, payload) => {
  if (!orderId || !payload) {
    throw new Error('Supply the orderId (url) and the payload of the order you wish to update.');
  }

  return docClient.get({
    TableName: 'pizza-orders',
    Key: {
      orderId,
    },
  }).promise()
    .then((result) => {
      if (!result.Item || !result.Item.orderId) {
        throw new Error('Order cannot be found.');
      }

      const updatedOrder = {
        ...result.Item,               // Existing data.
        ...payload,                   // Overwrite any existing data with the payload,
        orderId: result.Item.orderId, // but preserve the order id.
      };

      return docClient.put({
        TableName: 'pizza-orders',
        Item: updatedOrder,
      }).promise()
      .then((response) => {
        return response ? updatedOrder : new Error('Order could not be updated.');
      })
      .catch((error) => {
        throw error;
      });
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * Delete an existing order.
 * @param {string} orderId 
 */
const deleteOrders = (orderId) => {
  if (!orderId) {
    throw new Error('Supply the orderId of the order you wish to delete.');
  }

  return docClient.delete({
    TableName: 'pizza-orders',
    Key: {
      orderId,
    },
    ConditionExpression: 'orderId = :orderId',
    ExpressionAttributeValues: {
      ':orderId': orderId,
    },
  }).promise()
    .then((result) => {
      if (!result) {
        throw new Error('Deletion of order failed.');
      }

      return `Order ${orderId} has been deleted.`;
    })
    .catch((error) => {
      throw error;
    });
};

module.exports = {
  postOrders,
  getOrders,
  putOrders,
  deleteOrders,
};
