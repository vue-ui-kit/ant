import { numberToCNName, numberToLetters } from '../mockTool';

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  avatar: string;
  status: 'active' | 'inactive';
  role: string;
  department: string;
  createTime: string;
  lastLoginTime: string;
}

export const users: User[] = Array.from({ length: 1000 }, (_i, index) => ({
  id: index,
  name: numberToCNName(index),
  email: `user${index}@example.com`,
  age: Math.floor(Math.random() * 50) + 18,
  gender: Math.random() > 0.5 ? 'male' : 'female',
  phone: `138${String(index).padStart(8, '0')}`,
  address: `北京市朝阳区第${index}街道`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  role: ['管理员', '用户', '访客'][Math.floor(Math.random() * 3)],
  department: ['技术部', '产品部', '运营部', '市场部'][Math.floor(Math.random() * 4)],
  createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

export const queryUsers = (params: { page: number; size: number; keyword?: string }) => {
  const { page, size, keyword } = params;
  const start = (page - 1) * size;
  const end = start + size;
  const data = users.filter(
    (item) => !keyword || item.name.includes(keyword) || item.email.includes(keyword),
  );
  return Promise.resolve({
    total: data.length,
    list: data.slice(start, end),
  });
};

export const getUserById = (id: number) => {
  const user = users.find((u) => u.id === id);
  return Promise.resolve(user || null);
};
