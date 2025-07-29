import { numberToCNName, numberToLetters } from '../mockTool';
import { Student } from './type';

export const students: Student[] = Array.from(
  {
    length: 5000,
  },
  (_i, index) => ({
    id: index,
    name: numberToCNName(index),
    enName: numberToLetters(index),
    score: Math.floor(Math.random() * 100),
    grade: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'][
      Math.floor(Math.random() * 6)
    ],
  }),
);

export const queryStudents = (params: {
  page: number;
  size: number;
  keyword?: string;
  grade?: string;
}) => {
  const { page, size, keyword, grade } = params;
  const start = (page - 1) * size;
  const end = start + size;
  const data = students.filter(
    (item) =>
      (!grade || item.grade === grade) &&
      (!keyword || item.name.includes(keyword) || item.enName.includes(keyword)),
  );
  return Promise.resolve({
    total: data.length,
    list: data.slice(start, end),
  });
};
