export const noValue = (val: any) => val === null || val === undefined || val === '';
export const valued = (val: any) => !noValue(val);
