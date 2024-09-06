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
  }),
);

export const queryStudents = (params: { page: number; size: number; keyword?: string }) => {
  const { page, size, keyword } = params;
  const start = (page - 1) * size;
  const end = start + size;
  const data = students.filter(
    (item) => !keyword || item.name.includes(keyword) || item.enName.includes(keyword),
  );
  return Promise.resolve({
    total: data.length,
    list: data.slice(start, end),
  });
};
