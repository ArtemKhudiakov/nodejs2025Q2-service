import { validate as uuidValidate } from 'uuid';

export function isValidUUID(id: string): boolean {
  return uuidValidate(id);
}
