// 极简事件总线，模块之间解耦用
const handlers = new Map();
export const on = (name, fn) => { (handlers.get(name) ?? handlers.set(name, new Set()).get(name)).add(fn); return () => handlers.get(name)?.delete(fn); };
export const emit = (name, payload) => handlers.get(name)?.forEach((fn) => fn(payload));
