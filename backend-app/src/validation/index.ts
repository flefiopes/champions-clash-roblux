/**
 * Validation barrel export.
 * Re-exports all Zod schemas and their inferred types.
 *
 * @module validation
 */

export {
  PlayerLoginSchema,
  CoinTransactionSchema,
  PointContributionSchema,
  FactionJoinSchema,
} from './player.validation';
export type {
  PlayerLoginInput,
  CoinTransactionInput,
  PointContributionInput,
  FactionJoinInput,
} from './player.validation';

export { CreateWarSchema, UpdateWarSchema } from './war.validation';
export type { CreateWarInput, UpdateWarInput } from './war.validation';

export {
  CreateFactionSchema,
  UpdateFactionSchema,
  UpdateGameConfigSchema,
  CreateProductSchema,
  UpdateProductSchema,
  AdminPaginationSchema,
  TransactionFilterSchema,
} from './admin.validation';
export type {
  CreateFactionInput,
  UpdateFactionInput,
  UpdateGameConfigInput,
  CreateProductInput,
  UpdateProductInput,
  AdminPaginationInput,
  TransactionFilterInput,
} from './admin.validation';

export { ProcessPurchaseSchema } from './purchase.validation';
export type { ProcessPurchaseInput } from './purchase.validation';
