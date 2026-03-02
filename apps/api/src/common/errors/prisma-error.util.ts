import { Prisma } from '@prisma/client';

function asPrismaKnownError(error: unknown): Prisma.PrismaClientKnownRequestError | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error;
  }

  return null;
}

export function isPrismaNotFoundError(error: unknown): boolean {
  const knownError = asPrismaKnownError(error);
  return knownError?.code === 'P2025';
}

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  const knownError = asPrismaKnownError(error);
  return knownError?.code === 'P2002';
}

export function isPrismaForeignKeyError(error: unknown): boolean {
  const knownError = asPrismaKnownError(error);
  return knownError?.code === 'P2003';
}

export function getPrismaUniqueFields(error: unknown): string[] {
  const knownError = asPrismaKnownError(error);
  if (!knownError || !knownError.meta) {
    return [];
  }

  const target = knownError.meta.target;
  if (!Array.isArray(target)) {
    return [];
  }

  return target.filter((field): field is string => typeof field === 'string');
}
