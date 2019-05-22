const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const { getPizzas } = require('./pizzas');

/**
 * Return an order found from a given orderId, or return undefined if not found.
 * @param {string} orderId 
 */
const findOrderById = (orderId) => orders.find(o => o.orderId === Number(orderId));

/**
 * Throw an error because the given orderId cannot be found.
 * @param {string} orderId 
 */
const orderNotFound = (orderId) => {
  throw new Error(`Order ${orderId} cannot be found.`);
};

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
    orderId: 'some-id',
  };

  return docClient.put({
    TableName: 'pizza-orders',
    Item: {
      orderId: order.orderId,
      pizza: order.pizzaName,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
    },
  }).promise()
  .then((response) => {
    return response;
  })
  .catch((error) => {
    throw error;
  });
};

/**
 * Get an existing order when orderId is specified, or list all orders when no orderId is given.
 * @param {Number?} orderId 
 */
const getOrders = (orderId) => {
  if (!orderId) {
    return orders;
  }

  const order = findOrderById(orderId);

  if (order) {
    return order;
  }

  return orderNotFound(orderId);
};

/**
 * Update an existing order.
 * @param {Number} orderId 
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
 * @param {Number} orderId 
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
