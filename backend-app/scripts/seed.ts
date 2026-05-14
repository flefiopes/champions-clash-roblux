/**
 * Database seed script.
 * Injects initial game configuration, default products, factions, and mock players.
 */

import { randomUUID } from 'node:crypto';
import { getDatabase, initDatabase, closeDatabase } from '@/db';
import { getLogger } from '@/lib/logger';
import { 
  gameConfig, 
  products, 
  wars, 
  factions, 
  players, 
  playerFactions 
} from '@/db/schema';

const logger = getLogger();

async function runSeed() {
  logger.info('Starting database seed...');
  await initDatabase();
  const db = getDatabase();

  // 1. GLOBAL CONFIGURATION
  logger.info('Seeding game configuration...');
  const configs = [
    { key: 'global_multiplier', value: 1.0 },
    { key: 'xp_rate', value: 1.5 },
    { 
      key: 'minigames', 
      value: {
        parkour: { enabled: true, max_reward: 100 },
        sword_fight: { enabled: true, max_reward: 150 },
        race: { enabled: true, max_reward: 80 }
      }
    }
  ];

  for (const config of configs) {
    await db
      .insert(gameConfig)
      .values({
        key: config.key,
        value: config.value,
        updatedBy: 'seed',
      })
      .onDuplicateKeyUpdate({ set: { value: config.value } });
  }

  // 2. PRODUCTS (SHOP)
  logger.info('Seeding product catalogue...');
  const shopItems = [
    {
      id: randomUUID(),
      name: 'Petite bourse de Gemmes',
      robloxProductId: 1001,
      priceRobux: 100,
      type: 'gems' as const,
      value: { gems: 100 },
      isActive: true,
    },
    {
      id: randomUUID(),
      name: 'Double XP (1 Heure)',
      robloxProductId: 2001,
      priceRobux: 250,
      type: 'boost' as const,
      value: { boost: 'xp', duration_seconds: 3600, multiplier: 2 },
      isActive: true,
    },
    {
      id: randomUUID(),
      name: 'Réinitialisation de Faction',
      robloxProductId: 3001,
      priceRobux: 500,
      type: 'faction_reset' as const,
      value: {},
      isActive: true,
    }
  ];

  for (const item of shopItems) {
    await db.insert(products).values(item).onDuplicateKeyUpdate({
      set: { name: item.name, priceRobux: item.priceRobux, value: item.value }
    });
  }

  // 3. WAR & FACTIONS
  logger.info('Seeding active war and factions...');
  const warId = 'cc-war-001';
  await db.insert(wars).values({
    id: warId,
    name: 'La Bataille Éternelle',
    status: 'active',
    resetWeekly: true,
    createdBy: 'seed',
  }).onDuplicateKeyUpdate({ set: { name: 'La Bataille Éternelle' } });

  const factionAId = 'faction-solaria';
  const factionBId = 'faction-lunaris';

  await db.insert(factions).values({
    id: factionAId,
    warId,
    name: 'Solaria',
    colorHex: '#FFD700',
    slogan: 'Que la lumière nous guide vers la victoire !',
    totalPoints: 1250,
  }).onDuplicateKeyUpdate({ set: { name: 'Solaria', colorHex: '#FFD700' } });

  await db.insert(factions).values({
    id: factionBId,
    warId,
    name: 'Lunaris',
    colorHex: '#4B0082',
    slogan: 'Dans l\'ombre, nous régnons en maîtres.',
    totalPoints: 980,
  }).onDuplicateKeyUpdate({ set: { name: 'Lunaris', colorHex: '#4B0082' } });

  // 4. MOCK PLAYERS
  logger.info('Seeding mock players...');
  const mockPlayers = [
    {
      id: randomUUID(),
      robloxUserId: 12345,
      username: 'ShadowSlayer',
      coins: 1500,
      gems: 50,
      xp: 4500,
      rank: 'veteran' as const,
      factionId: factionBId,
    },
    {
      id: randomUUID(),
      robloxUserId: 67890,
      username: 'LightBringer',
      coins: 2000,
      gems: 120,
      xp: 8000,
      rank: 'champion' as const,
      factionId: factionAId,
    }
  ];

  for (const p of mockPlayers) {
    const { factionId, ...playerData } = p;
    await db.insert(players).values(playerData).onDuplicateKeyUpdate({
      set: { username: p.username, coins: p.coins, gems: p.gems, xp: p.xp }
    });

    // Link player to faction
    await db.insert(playerFactions).values({
      playerId: p.id,
      factionId,
      warId,
      weeklyPoints: 500,
      alltimePoints: 1000,
    }).onDuplicateKeyUpdate({ set: { weeklyPoints: 500 } });
  }

  logger.info('Database seed completed successfully.');
  await closeDatabase();
}

runSeed().catch((error) => {
  logger.error({ error }, 'Database seed failed');
  process.exit(1);
});
