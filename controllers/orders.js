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
    Item: {
      orderId: order.orderId,
      pizza: order.pizzaName,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      timestamp: order.timestamp,
    },
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
 */
const putOrders = (orderId, payload) => {
  if (!orderId || !payload) {
    throw new Error('Supply the orderId (url) and the payload of the order you wish to update.');
  }

  const order = findOrderById(orderId);

  if (!order) {
    return orderNotFound(orderId);
  }

  const updatedOrder = {
    ...order,     // Existing data.
    ...payload,   // Overwrite any existing data with the payload,
    id: order.id, // but preserve the order id.
  };

  orders = orders.map((o) => {
    return (o.id === Number(orderId)) ? updatedOrder : o;
  });

  return updatedOrder;
};

/**
 * Delete an existing order.
 * @param {string} orderId 
 */
const deleteOrders = (orderId) => {
  if (!orderId) {
    throw new Error('Supply the orderId of the order you wish to delete.');
  }

  const order = findOrderById(orderId);
  const index = orders.indexOf(order);

  if (!order) {
    return orderNotFound(orderId);
  }

  orders.splice(index, 1);

  return {
    deleted: order,
    orders,
  };
};

module.exports = {
  postOrders,
  getOrders,
  putOrders,
  deleteOrders,
};
