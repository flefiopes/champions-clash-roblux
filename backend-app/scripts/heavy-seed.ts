/**
 * Heavy database seed script.
 * Injects a large volume of data to test admin dashboard limits.
 * - 10 Wars
 * - 5 Factions per War
 * - 1000 Players
 * - 5000 Transactions
 * - 50 Quests, 50 Badges, 50 Products
 * - 2000 Player Quest Progressions
 */

import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { getDatabase, initDatabase, closeDatabase } from '@/db';
import { getLogger } from '@/lib/logger';
import { 
  wars, 
  factions, 
  players, 
  playerFactions,
  badges,
  quests,
  products,
  transactions,
  playerQuests
} from '@/db/schema';

const logger = getLogger();

async function runHeavySeed() {
  logger.info('Starting heavy database seed...');
  await initDatabase();
  const db = getDatabase();

  try {
    // 1. WARS & FACTIONS
    logger.info('Seeding 10 wars and 50 factions...');
    const warIds: string[] = [];
    const factionIds: string[] = [];

    for (let i = 0; i < 10; i++) {
      const warId = randomUUID();
      warIds.push(warId);
      await db.insert(wars).values({
        id: warId,
        name: `War ${faker.word.adjective()} ${faker.word.noun()} #${i + 1}`,
        status: (i === 0 ? 'active' : 'finished') as 'active' | 'finished',
        resetWeekly: true,
        createdBy: 'heavy-seed',
      });

      for (let j = 0; j < 5; j++) {
        const factionId = randomUUID();
        factionIds.push(factionId);
        await db.insert(factions).values({
          id: factionId,
          warId,
          name: `${faker.commerce.productAdjective()} ${faker.animal.dog()}`,
          colorHex: faker.color.rgb(),
          slogan: faker.company.catchPhrase(),
          totalPoints: faker.number.int({ min: 1000, max: 1000000 }),
        });
      }
    }

    // 2. PRODUCTS, BADGES, QUESTS
    logger.info('Seeding 50 products, 50 badges, 50 quests...');
    const questIds: string[] = [];
    for (let i = 0; i < 50; i++) {
      await db.insert(products).values({
        id: randomUUID(),
        name: faker.commerce.productName(),
        robloxProductId: 40000 + i,
        priceRobux: faker.number.int({ min: 10, max: 5000 }),
        type: faker.helpers.arrayElement(['gems', 'boost', 'faction_reset']) as any,
        value: { coins: 1000, gems: 100 },
        isActive: true,
      });

      await db.insert(badges).values({
        id: randomUUID(),
        slug: `badge-${faker.string.alphanumeric(10)}`,
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        imageUrl: `https://picsum.photos/200?random=${i}`,
        rarity: faker.helpers.arrayElement(['common', 'rare', 'epic', 'legendary']) as any,
        isPermanent: true,
      });

      const questId = randomUUID();
      questIds.push(questId);
      await db.insert(quests).values({
        id: questId,
        type: faker.helpers.arrayElement(['daily', 'recruit', 'seasonal', 'secret']) as any,
        title: faker.company.buzzPhrase(),
        description: faker.lorem.sentence(),
        requirementType: faker.helpers.arrayElement(['coins_earned', 'games_played', 'faction_join']),
        requirementValue: faker.number.int({ min: 10, max: 5000 }),
        rewardCoins: faker.number.int({ min: 100, max: 1000 }),
        rewardXp: faker.number.int({ min: 50, max: 500 }),
      });
    }

    // 3. PLAYERS
    logger.info('Seeding 1000 players...');
    const playerIds: string[] = [];
    let playerChunks: any[] = [];

    for (let i = 0; i < 1000; i++) {
      const playerId = randomUUID();
      playerIds.push(playerId);
      playerChunks.push({
        id: playerId,
        robloxUserId: 400000 + i,
        username: faker.internet.username(),
        coins: faker.number.int({ min: 0, max: 1000000 }),
        gems: faker.number.int({ min: 0, max: 10000 }),
        xp: faker.number.int({ min: 0, max: 500000 }),
        rank: faker.helpers.arrayElement(['recruit', 'militant', 'activist', 'veteran', 'elite', 'champion', 'legend']) as any,
      });

      if (playerChunks.length === 100) {
        await db.insert(players).values(playerChunks);
        playerChunks = [];
      }
    }
    if (playerChunks.length > 0) await db.insert(players).values(playerChunks);

    // 4. PLAYER FACTIONS
    logger.info('Assigning players to factions...');
    let pfChunks: any[] = [];
    for (const pid of playerIds) {
      if (Math.random() > 0.3) {
        const warIdx = faker.number.int({ min: 0, max: 9 });
        const warId = warIds[warIdx];
        const warFactions = factionIds.slice(warIdx * 5, warIdx * 5 + 5);
        const factionId = faker.helpers.arrayElement(warFactions);

        pfChunks.push({
          playerId: pid,
          factionId,
          warId,
          weeklyPoints: faker.number.int({ min: 0, max: 50000 }),
          alltimePoints: faker.number.int({ min: 0, max: 500000 }),
          joinedAt: faker.date.past(),
        });
      }
      if (pfChunks.length === 100) {
        await db.insert(playerFactions).values(pfChunks);
        pfChunks = [];
      }
    }
    if (pfChunks.length > 0) await db.insert(playerFactions).values(pfChunks);

    // 5. PLAYER QUESTS
    logger.info('Seeding 2000 quest completions...');
    let pqChunks: any[] = [];
    const usedPairs = new Set<string>();

    for (let i = 0; i < 2000; i++) {
      const playerId = faker.helpers.arrayElement(playerIds);
      const questId = faker.helpers.arrayElement(questIds);
      const pair = `${playerId}:${questId}`;

      if (!usedPairs.has(pair)) {
        usedPairs.add(pair);
        pqChunks.push({
          playerId,
          questId,
          status: faker.helpers.arrayElement(['active', 'completed', 'claimed']) as any,
          currentValue: faker.number.int({ min: 0, max: 100 }),
          assignedAt: faker.date.recent({ days: 15 }),
          updatedAt: faker.date.recent({ days: 2 }),
        });
      }

      if (pqChunks.length === 200) {
        await db.insert(playerQuests).values(pqChunks);
        pqChunks = [];
      }
    }
    if (pqChunks.length > 0) await db.insert(playerQuests).values(pqChunks);

    // 6. TRANSACTIONS
    logger.info('Seeding 5000 transactions...');
    let txChunks: any[] = [];
    for (let i = 0; i < 5000; i++) {
      txChunks.push({
        id: randomUUID(),
        playerId: faker.helpers.arrayElement(playerIds),
        type: faker.helpers.arrayElement(['coin_gain', 'coin_spend', 'gem_gain', 'gem_spend', 'xp_gain', 'point_contribution', 'idle_collect', 'upgrade_buy', 'quest_reward']) as any,
        amount: faker.number.int({ min: 1, max: 10000 }),
        source: faker.helpers.arrayElement(['minigame_race', 'daily_login', 'shop_purchase', 'admin_adjustment', 'quest_reward']),
        createdAt: faker.date.recent({ days: 30 }),
      });

      if (txChunks.length === 500) {
        await db.insert(transactions).values(txChunks);
        txChunks = [];
      }
    }
    if (txChunks.length > 0) await db.insert(transactions).values(txChunks);

    logger.info('Heavy database seed completed successfully!');
  } catch (err) {
    logger.error({ err }, 'Heavy database seed encountered an error');
    throw err;
  } finally {
    await closeDatabase();
  }
}

runHeavySeed().catch((error) => {
  console.error('CRITICAL ERROR:', error);
  process.exit(1);
});
