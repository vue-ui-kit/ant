import { numberToCNName } from '../mockTool';

export interface FamilyMember {
  id: number;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  deathDate?: string;
  age: number;
  generation: number;
  spouse?: string;
  children: FamilyMember[];
  parentId?: number;
  isAlive: boolean;
  occupation?: string;
  education?: string;
  address?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  description?: string;
  tags: string[];
  createTime: string;
  updateTime: string;
}

// 生成族谱树形数据
const generateFamilyTree = (): FamilyMember[] => {
  const familyData: FamilyMember[] = [];
  let idCounter = 0;

  // 第一代 - 祖先
  const ancestor: FamilyMember = {
    id: idCounter++,
    name: '张氏先祖',
    gender: 'male',
    birthDate: '1800-01-01',
    deathDate: '1880-12-31',
    age: 80,
    generation: 1,
    children: [],
    isAlive: false,
    occupation: '农民',
    education: '私塾',
    address: '河北省张家庄',
    description: '张氏家族第一代先祖，开创了张氏家族的历史',
    tags: ['先祖', '第一代'],
    createTime: '1800-01-01T00:00:00.000Z',
    updateTime: '1880-12-31T00:00:00.000Z',
  };

  // 第二代 - 祖先的子女
  const secondGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张大山',
      gender: 'male',
      birthDate: '1825-03-15',
      deathDate: '1905-08-20',
      age: 80,
      generation: 2,
      parentId: ancestor.id,
      children: [],
      isAlive: false,
      occupation: '商人',
      education: '私塾',
      address: '河北省张家庄',
      description: '张氏家族第二代长子，经营布匹生意',
      tags: ['第二代', '长子'],
      createTime: '1825-03-15T00:00:00.000Z',
      updateTime: '1905-08-20T00:00:00.000Z',
    },
    {
      id: idCounter++,
      name: '张小花',
      gender: 'female',
      birthDate: '1828-07-22',
      deathDate: '1910-03-10',
      age: 82,
      generation: 2,
      parentId: ancestor.id,
      children: [],
      isAlive: false,
      occupation: '家庭主妇',
      education: '私塾',
      address: '河北省张家庄',
      description: '张氏家族第二代长女',
      tags: ['第二代', '长女'],
      createTime: '1828-07-22T00:00:00.000Z',
      updateTime: '1910-03-10T00:00:00.000Z',
    },
  ];

  // 第三代 - 张大山的子女
  const thirdGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张建国',
      gender: 'male',
      birthDate: '1850-05-10',
      deathDate: '1920-12-05',
      age: 70,
      generation: 3,
      parentId: secondGen[0].id,
      children: [],
      isAlive: false,
      occupation: '教师',
      education: '私塾',
      address: '河北省张家庄',
      description: '张氏家族第三代长子，成为当地私塾教师',
      tags: ['第三代', '长子', '教师'],
      createTime: '1850-05-10T00:00:00.000Z',
      updateTime: '1920-12-05T00:00:00.000Z',
    },
    {
      id: idCounter++,
      name: '张美丽',
      gender: 'female',
      birthDate: '1853-09-18',
      deathDate: '1925-06-12',
      age: 72,
      generation: 3,
      parentId: secondGen[0].id,
      children: [],
      isAlive: false,
      occupation: '家庭主妇',
      education: '私塾',
      address: '河北省张家庄',
      description: '张氏家族第三代长女',
      tags: ['第三代', '长女'],
      createTime: '1853-09-18T00:00:00.000Z',
      updateTime: '1925-06-12T00:00:00.000Z',
    },
  ];

  // 第四代 - 张建国的子女
  const fourthGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张伟',
      gender: 'male',
      birthDate: '1875-12-03',
      deathDate: '1945-03-20',
      age: 70,
      generation: 4,
      parentId: thirdGen[0].id,
      children: [],
      isAlive: false,
      occupation: '医生',
      education: '医学院',
      address: '北京市',
      description: '张氏家族第四代长子，成为医生',
      tags: ['第四代', '长子', '医生'],
      createTime: '1875-12-03T00:00:00.000Z',
      updateTime: '1945-03-20T00:00:00.000Z',
    },
    {
      id: idCounter++,
      name: '张芳',
      gender: 'female',
      birthDate: '1878-04-15',
      deathDate: '1950-08-30',
      age: 72,
      generation: 4,
      parentId: thirdGen[0].id,
      children: [],
      isAlive: false,
      occupation: '护士',
      education: '护士学校',
      address: '北京市',
      description: '张氏家族第四代长女，成为护士',
      tags: ['第四代', '长女', '护士'],
      createTime: '1878-04-15T00:00:00.000Z',
      updateTime: '1950-08-30T00:00:00.000Z',
    },
  ];

  // 第五代 - 张伟的子女
  const fifthGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张明',
      gender: 'male',
      birthDate: '1900-08-25',
      deathDate: '1975-11-10',
      age: 75,
      generation: 5,
      parentId: fourthGen[0].id,
      children: [],
      isAlive: false,
      occupation: '工程师',
      education: '大学',
      address: '上海市',
      description: '张氏家族第五代长子，成为工程师',
      tags: ['第五代', '长子', '工程师'],
      createTime: '1900-08-25T00:00:00.000Z',
      updateTime: '1975-11-10T00:00:00.000Z',
    },
    {
      id: idCounter++,
      name: '张丽',
      gender: 'female',
      birthDate: '1903-02-14',
      deathDate: '1980-05-20',
      age: 77,
      generation: 5,
      parentId: fourthGen[0].id,
      children: [],
      isAlive: false,
      occupation: '教师',
      education: '师范大学',
      address: '上海市',
      description: '张氏家族第五代长女，成为教师',
      tags: ['第五代', '长女', '教师'],
      createTime: '1903-02-14T00:00:00.000Z',
      updateTime: '1980-05-20T00:00:00.000Z',
    },
  ];

  // 第六代 - 张明的子女
  const sixthGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张强',
      gender: 'male',
      birthDate: '1925-06-10',
      deathDate: '2000-09-15',
      age: 75,
      generation: 6,
      parentId: fifthGen[0].id,
      children: [],
      isAlive: false,
      occupation: '科学家',
      education: '博士',
      address: '北京市',
      description: '张氏家族第六代长子，成为科学家',
      tags: ['第六代', '长子', '科学家'],
      createTime: '1925-06-10T00:00:00.000Z',
      updateTime: '2000-09-15T00:00:00.000Z',
    },
    {
      id: idCounter++,
      name: '张华',
      gender: 'female',
      birthDate: '1928-11-20',
      deathDate: '2005-03-08',
      age: 77,
      generation: 6,
      parentId: fifthGen[0].id,
      children: [],
      isAlive: false,
      occupation: '作家',
      education: '大学',
      address: '北京市',
      description: '张氏家族第六代长女，成为作家',
      tags: ['第六代', '长女', '作家'],
      createTime: '1928-11-20T00:00:00.000Z',
      updateTime: '2005-03-08T00:00:00.000Z',
    },
  ];

  // 第七代 - 张强的子女（现代）
  const seventhGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张建国',
      gender: 'male',
      birthDate: '1950-03-15',
      age: 74,
      generation: 7,
      parentId: sixthGen[0].id,
      children: [],
      isAlive: true,
      occupation: '企业家',
      education: 'MBA',
      address: '深圳市',
      phone: '13800138000',
      email: 'zhangjianguo@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangjianguo',
      description: '张氏家族第七代长子，创立了科技公司',
      tags: ['第七代', '长子', '企业家'],
      createTime: '1950-03-15T00:00:00.000Z',
      updateTime: new Date().toISOString(),
    },
    {
      id: idCounter++,
      name: '张美丽',
      gender: 'female',
      birthDate: '1953-07-22',
      age: 71,
      generation: 7,
      parentId: sixthGen[0].id,
      children: [],
      isAlive: true,
      occupation: '医生',
      education: '医学博士',
      address: '广州市',
      phone: '13900139000',
      email: 'zhangmeili@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangmeili',
      description: '张氏家族第七代长女，成为知名医生',
      tags: ['第七代', '长女', '医生'],
      createTime: '1953-07-22T00:00:00.000Z',
      updateTime: new Date().toISOString(),
    },
  ];

  // 第八代 - 张建国的子女（当代）
  const eighthGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张小明',
      gender: 'male',
      birthDate: '1980-12-05',
      age: 44,
      generation: 8,
      parentId: seventhGen[0].id,
      children: [],
      isAlive: true,
      occupation: '软件工程师',
      education: '计算机科学硕士',
      address: '北京市朝阳区',
      phone: '13700137000',
      email: 'zhangxiaoming@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaoming',
      description: '张氏家族第八代长子，在互联网公司工作',
      tags: ['第八代', '长子', '工程师'],
      createTime: '1980-12-05T00:00:00.000Z',
      updateTime: new Date().toISOString(),
    },
    {
      id: idCounter++,
      name: '张小芳',
      gender: 'female',
      birthDate: '1983-05-18',
      age: 41,
      generation: 8,
      parentId: seventhGen[0].id,
      children: [],
      isAlive: true,
      occupation: '设计师',
      education: '艺术设计学士',
      address: '上海市浦东新区',
      phone: '13600136000',
      email: 'zhangxiaofang@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaofang',
      description: '张氏家族第八代长女，成为知名设计师',
      tags: ['第八代', '长女', '设计师'],
      createTime: '1983-05-18T00:00:00.000Z',
      updateTime: new Date().toISOString(),
    },
  ];

  // 第九代 - 张小明和张小芳的子女（新生代）
  const ninthGen: FamilyMember[] = [
    {
      id: idCounter++,
      name: '张天宇',
      gender: 'male',
      birthDate: '2010-08-12',
      age: 14,
      generation: 9,
      parentId: eighthGen[0].id,
      children: [],
      isAlive: true,
      occupation: '学生',
      education: '初中',
      address: '北京市朝阳区',
      phone: '13500135000',
      email: 'zhangtianyu@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangtianyu',
      description: '张氏家族第九代长子，正在读初中',
      tags: ['第九代', '长子', '学生'],
      createTime: '2010-08-12T00:00:00.000Z',
      updateTime: new Date().toISOString(),
    },
    {
      id: idCounter++,
      name: '张小雨',
      gender: 'female',
      birthDate: '2015-03-25',
      age: 9,
      generation: 9,
      parentId: eighthGen[1].id,
      children: [],
      isAlive: true,
      occupation: '学生',
      education: '小学',
      address: '上海市浦东新区',
      phone: '13400134000',
      email: 'zhangxiaoyu@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaoyu',
      description: '张氏家族第九代长女，正在读小学',
      tags: ['第九代', '长女', '学生'],
      createTime: '2015-03-25T00:00:00.000Z',
      updateTime: new Date().toISOString(),
    },
  ];

  // 构建树形结构
  const buildTree = (members: FamilyMember[], parentId?: number): FamilyMember[] => {
    return members
      .filter((member) => member.parentId === parentId)
      .map((member) => ({
        ...member,
        children: buildTree(members, member.id),
      }));
  };

  // 合并所有成员
  const allMembers = [
    ancestor,
    ...secondGen,
    ...thirdGen,
    ...fourthGen,
    ...fifthGen,
    ...sixthGen,
    ...seventhGen,
    ...eighthGen,
    ...ninthGen,
  ];

  // 构建树形结构
  return buildTree(allMembers);
};

export const familyTree = generateFamilyTree();

// 查询族谱成员
export const queryFamilyMembers = (params: {
  page: number;
  size: number;
  keyword?: string;
  generation?: number;
  gender?: string;
  isAlive?: boolean;
}) => {
  const { page, size, keyword, generation, gender, isAlive } = params;
  const start = (page - 1) * size;
  const end = start + size;

  // 扁平化树形数据用于搜索
  const flattenMembers = (members: FamilyMember[]): FamilyMember[] => {
    let result: FamilyMember[] = [];
    members.forEach((member) => {
      result.push(member);
      if (member.children.length > 0) {
        result = result.concat(flattenMembers(member.children));
      }
    });
    return result;
  };

  let data = flattenMembers(familyTree);

  if (keyword) {
    data = data.filter(
      (item) =>
        item.name.includes(keyword) ||
        item.occupation?.includes(keyword) ||
        item.description?.includes(keyword),
    );
  }

  if (generation) {
    data = data.filter((item) => item.generation === generation);
  }

  if (gender) {
    data = data.filter((item) => item.gender === gender);
  }

  if (isAlive !== undefined) {
    data = data.filter((item) => item.isAlive === isAlive);
  }

  return Promise.resolve({
    total: data.length,
    list: data.slice(start, end),
  });
};

// 获取族谱树形数据
export const getFamilyTree = () => {
  return Promise.resolve(familyTree);
};

// 根据ID获取成员详情
export const getFamilyMemberById = (id: number) => {
  const findMember = (members: FamilyMember[], targetId: number): FamilyMember | null => {
    for (const member of members) {
      if (member.id === targetId) {
        return member;
      }
      if (member.children.length > 0) {
        const found = findMember(member.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const member = findMember(familyTree, id);
  return Promise.resolve(member || null);
};

// 获取指定代数的成员
export const getFamilyMembersByGeneration = (generation: number) => {
  const flattenMembers = (members: FamilyMember[]): FamilyMember[] => {
    let result: FamilyMember[] = [];
    members.forEach((member) => {
      result.push(member);
      if (member.children.length > 0) {
        result = result.concat(flattenMembers(member.children));
      }
    });
    return result;
  };

  const allMembers = flattenMembers(familyTree);
  const members = allMembers.filter((member) => member.generation === generation);

  return Promise.resolve({
    total: members.length,
    list: members,
  });
};

// 获取在世成员
export const getLivingMembers = () => {
  const flattenMembers = (members: FamilyMember[]): FamilyMember[] => {
    let result: FamilyMember[] = [];
    members.forEach((member) => {
      result.push(member);
      if (member.children.length > 0) {
        result = result.concat(flattenMembers(member.children));
      }
    });
    return result;
  };

  const allMembers = flattenMembers(familyTree);
  const livingMembers = allMembers.filter((member) => member.isAlive);

  return Promise.resolve({
    total: livingMembers.length,
    list: livingMembers,
  });
};
