import { numberToCNName } from '../mockTool';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  manager: string;
  team: string[];
  tags: string[];
  createTime: string;
  updateTime: string;
}

const projectNames = [
  '电商平台重构',
  '移动端APP开发',
  '数据中台建设',
  'AI算法优化',
  '用户画像系统',
  '支付系统升级',
  '客服系统开发',
  '营销活动平台',
  '内容管理系统',
  '报表分析系统',
];

const projectDescriptions = [
  '重构现有电商平台，提升性能和用户体验',
  '开发全新的移动端应用，支持iOS和Android',
  '建设企业级数据中台，统一数据管理',
  '优化机器学习算法，提升推荐准确率',
  '构建用户画像系统，支持精准营销',
  '升级支付系统，支持多种支付方式',
  '开发智能客服系统，提升服务效率',
  '构建营销活动平台，支持多种营销玩法',
  '开发内容管理系统，支持多端内容发布',
  '构建报表分析系统，提供数据洞察',
];

export const projects: Project[] = Array.from({ length: 500 }, (_i, index) => {
  const statuses: Project['status'][] = ['planning', 'in_progress', 'completed', 'cancelled'];
  const priorities: Project['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000);

  return {
    id: index,
    name: projectNames[index % projectNames.length] + ` (${index + 1})`,
    description: projectDescriptions[index % projectDescriptions.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    budget: Math.floor(Math.random() * 1000000) + 100000,
    progress: Math.floor(Math.random() * 100),
    manager: numberToCNName(index),
    team: Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) =>
      numberToCNName(index * 10 + i),
    ),
    tags: ['前端', '后端', '移动端', 'AI', '数据', '安全'].slice(
      0,
      Math.floor(Math.random() * 4) + 1,
    ),
    createTime: startDate.toISOString(),
    updateTime: new Date(
      startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()),
    ).toISOString(),
  };
});

export const queryProjects = (params: {
  page: number;
  size: number;
  keyword?: string;
  status?: string;
}) => {
  const { page, size, keyword, status } = params;
  const start = (page - 1) * size;
  const end = start + size;
  let data = projects;

  if (keyword) {
    data = data.filter(
      (item) =>
        item.name.includes(keyword) ||
        item.description.includes(keyword) ||
        item.manager.includes(keyword),
    );
  }

  if (status) {
    data = data.filter((item) => item.status === status);
  }

  return Promise.resolve({
    total: data.length,
    list: data.slice(start, end),
  });
};

export const getProjectById = (id: number) => {
  const project = projects.find((p) => p.id === id);
  return Promise.resolve(project || null);
};
