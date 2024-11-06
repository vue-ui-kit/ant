export const noValue = (val: any) => val === null || val === undefined || val === '';
export const valued = (val: any) => !noValue(val);
export const isBadValue = (val: any) => val === null || val === undefined;
export const isGoodValue = (val: any) => !isBadValue(val);
