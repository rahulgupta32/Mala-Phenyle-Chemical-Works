import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prismaInstance: PrismaClient | undefined;

function getPrismaInstance(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    if (!_prismaInstance) {
      _prismaInstance = new PrismaClient();
    }
    return _prismaInstance;
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
  }
}

// Export a Proxy to defer instantiation until database access occurs
export const db = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrismaInstance();
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  set(target, prop, value, receiver) {
    const instance = getPrismaInstance();
    return Reflect.set(instance, prop, value);
  }
});

export default db;
