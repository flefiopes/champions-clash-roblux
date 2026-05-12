/**
 * Weekly war reset cron job.
 * Runs every Monday at 00:00 UTC.
 * Iterates over all active wars with reset_weekly=true, executes the weekly reset pipeline,
 * and posts a Discord webhook notification with the winner announcement.
 *
 * @module cron/jobs/weekly-war-reset
 */

import { eq, and } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { wars, factions } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { getEnvConfig } from '@/config';
import { performWeeklyReset } from '@/services/war/war.service';
import type { CronJobDefinition } from '../types';

/** Cron job logger */
const logger = createChildLogger({ module: 'cron/weekly-war-reset' });

/**
 * Sends a Discord webhook notification announcing the weekly war winner.
 * Silently skips if DISCORD_WEBHOOK_URL is not configured.
 *
 * @param warName - Display name of the war
 * @param winnerFactionName - Display name of the winning faction
 * @param winnerFactionColor - Hex color of the winning faction
 */
async function notifyDiscord(
  warName: string,
  winnerFactionName: string,
  winnerFactionColor: string
): Promise<void> {
  const env = getEnvConfig();
  if (!env.discord.webhookUrl) return;

  try {
    const payload = {
      embeds: [
        {
          title: '🏆 Champions Clash — Weekly Reset',
          description: `**${warName}** : La semaine se termine !`,
          color: parseInt(winnerFactionColor.replace('#', ''), 16),
          fields: [
            {
              name: '🎉 Camp Vainqueur',
              value: `**${winnerFactionName}** remporte la semaine !`,
              inline: false,
            },
          ],
          footer: {
            text: 'Les scores hebdomadaires ont été remis à zéro. Bonne chance cette semaine !',
          },
        },
      ],
    };

    const response = await fetch(env.discord.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, 'Discord webhook returned non-2xx status');
    } else {
      logger.info({ warName, winnerFactionName }, 'Discord war-reset notification sent');
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to send Discord war-reset notification');
  }
}

/**
 * Executes the weekly war reset for all eligible wars.
 * Called automatically by the BullMQ cron scheduler.
 */
async function runWeeklyWarReset(): Promise<void> {
  logger.info('Weekly war reset started');

  const db = getDatabase();

  // Fetch all active wars that have weekly resets enabled
  const activeWars = await db
    .select({ id: wars.id, name: wars.name })
    .from(wars)
    .where(and(eq(wars.status, 'active'), eq(wars.resetWeekly, true)));

  if (activeWars.length === 0) {
    logger.info('No active wars with weekly reset enabled — skipping');
    return;
  }

  for (const war of activeWars) {
    try {
      const winnerFactionId = await performWeeklyReset(war.id);

      if (!winnerFactionId) continue;

      // Fetch winner faction details for the Discord notification
      const winnerRows = await db
        .select({ name: factions.name, colorHex: factions.colorHex })
        .from(factions)
        .where(eq(factions.id, winnerFactionId))
        .limit(1);

      if (winnerRows.length > 0) {
        const winner = winnerRows[0]!;
        await notifyDiscord(war.name, winner.name, winner.colorHex);
      }
    } catch (err) {
      logger.error({ warId: war.id, err }, 'Weekly reset failed for war');
    }
  }

  logger.info({ warCount: activeWars.length }, 'Weekly war reset completed');
}

/**
 * Cron job definition — runs every Monday at 00:00 UTC.
 */
export const weeklyWarResetJob: CronJobDefinition = {
  name: 'weekly-war-reset',
  cron: '0 0 * * 1',
  handler: runWeeklyWarReset,
};
