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
  UpgradeAttributeSchema,
} from './player.validation';
export type {
  PlayerLoginInput,
  CoinTransactionInput,
  PointContributionInput,
  FactionJoinInput,
  UpgradeAttributeInput,
} from './player.validation';

export { CreateWarSchema, UpdateWarSchema } from './war.validation';
export type { CreateWarInput, UpdateWarInput } from './war.validation';

export {
  CreateFactionSchema,
  UpdateFactionSchema,
  UpdateGameConfigSchema,
  BulkUpdateGameConfigSchema,
  CreateProductSchema,
  UpdateProductSchema,
  AdminPaginationSchema,
  TransactionFilterSchema,
  CreateQuestSchema,
  UpdateQuestSchema,
  CreateBadgeSchema,
  UpdateBadgeSchema,
} from './admin.validation';
export type {
  CreateFactionInput,
  UpdateFactionInput,
  UpdateGameConfigInput,
  BulkUpdateGameConfigInput,
  CreateProductInput,
  UpdateProductInput,
  AdminPaginationInput,
  TransactionFilterInput,
  CreateQuestInput,
  UpdateQuestInput,
  CreateBadgeInput,
  UpdateBadgeInput,
} from './admin.validation';

export { ProcessPurchaseSchema } from './purchase.validation';
export type { ProcessPurchaseInput } from './purchase.validation';
