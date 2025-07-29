import { numberToCNName } from '../mockTool';

export interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'alipay' | 'wechat' | 'credit_card' | 'bank_transfer';
  shippingAddress: string;
  createTime: string;
  payTime?: string;
  shipTime?: string;
  deliverTime?: string;
  notes?: string;
}

const productNames = [
  'iPhone 15 Pro',
  'MacBook Air M2',
  'iPad Pro 12.9',
  'Apple Watch Series 9',
  'AirPods Pro',
  'iMac 24',
  'Mac mini M2',
  'iPad Air',
  'Apple TV 4K',
  'HomePod mini',
];

const paymentMethods: Order['paymentMethod'][] = [
  'alipay',
  'wechat',
  'credit_card',
  'bank_transfer',
];
const statuses: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export const orders: Order[] = Array.from({ length: 2000 }, (_i, index) => {
  const createTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const quantity = Math.floor(Math.random() * 5) + 1;
  const unitPrice = Math.floor(Math.random() * 10000) + 1000;
  const totalAmount = quantity * unitPrice;

  let payTime, shipTime, deliverTime;

  if (status !== 'pending' && status !== 'cancelled') {
    payTime = new Date(createTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString();
  }

  if (status === 'shipped' || status === 'delivered') {
    shipTime = new Date(
      new Date(payTime!).getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  if (status === 'delivered') {
    deliverTime = new Date(
      new Date(shipTime!).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  return {
    id: index,
    orderNo: `ORD${String(index).padStart(6, '0')}`,
    customerName: numberToCNName(index),
    customerPhone: `138${String(index).padStart(8, '0')}`,
    customerEmail: `customer${index}@example.com`,
    productName: productNames[index % productNames.length],
    quantity,
    unitPrice,
    totalAmount,
    status,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    shippingAddress: `北京市朝阳区第${index}街道${index}号`,
    createTime: createTime.toISOString(),
    payTime,
    shipTime,
    deliverTime,
    notes: Math.random() > 0.7 ? `订单备注：${index}号订单的特殊要求` : undefined,
  };
});

export const queryOrders = (params: {
  page: number;
  size: number;
  keyword?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { page, size, keyword, status, startDate, endDate } = params;
  const start = (page - 1) * size;
  const end = start + size;
  let data = orders;

  if (keyword) {
    data = data.filter(
      (item) =>
        item.orderNo.includes(keyword) ||
        item.customerName.includes(keyword) ||
        item.productName.includes(keyword),
    );
  }

  if (status) {
    data = data.filter((item) => item.status === status);
  }

  if (startDate && endDate) {
    data = data.filter((item) => {
      const orderDate = new Date(item.createTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return orderDate >= start && orderDate <= end;
    });
  }

  return Promise.resolve({
    total: data.length,
    list: data.slice(start, end),
  });
};

export const getOrderById = (id: number) => {
  const order = orders.find((o) => o.id === id);
  return Promise.resolve(order || null);
};
