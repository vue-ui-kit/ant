const letters = 'abcdefghijklmnopqrstuvwxyz';
const CNFirstName =
  '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺';
const CNSecondString = '小晓阿大忠长承常永宏宇宪宗宜宙宝宁';
const CNThirdString = '强刚勇明红志召敏杰峰磊军洪兵旭威亮鹏飞彬鑫伟波斌涛昌进俊辉永春霖云鸿贤';
export const numberRecursionString = (stringPool: string, num: number): string =>
  num < stringPool.length
    ? stringPool[num]
    : numberRecursionString(stringPool, Math.floor(num / stringPool.length) - 1);
export const numberToLetters = (num: number): string => numberRecursionString(letters, num);
export const numberToCNName = (num: number): string =>
  `${CNFirstName[num % CNFirstName.length]}${CNSecondString[num % CNSecondString.length]}${CNThirdString[num % CNThirdString.length]}`;
