import * as db from "../db";
import { BADGE_DEFINITIONS, getBadgesForEvent } from "./definitions";
import { notifyOwner } from "../_core/notification";

/**
 * Verifica e concede badges para um usuário baseado em um evento
 * @param userId - ID do usuário
 * @param event - Nome do evento que pode desbloquear badges
 * @returns Array de badges desbloqueados nesta verificação
 */
export async function checkAndAwardBadges(userId: number, event: string): Promise<string[]> {
  try {
    // Buscar badges relevantes para este evento
    const relevantBadges = getBadgesForEvent(event);
    
    if (relevantBadges.length === 0) {
      return [];
    }
    
    // Buscar badges já conquistados pelo usuário
    const userBadges = await db.getUserBadges(userId);
    const userBadgeIds = new Set(userBadges.map(b => b.badge.name));
    
    const newlyAwardedBadges: string[] = [];
    
    // Verificar cada badge relevante
    for (const badge of relevantBadges) {
      // Pular se já possui
      if (userBadgeIds.has(badge.id)) {
        continue;
      }
      
      // Verificar condição
      const shouldAward = await badge.checkCondition(userId);
      
      if (shouldAward) {
        // Criar badge no banco
        const badgeId = await db.createBadge({
          name: badge.name,
          description: badge.description,
          iconUrl: badge.icon,
          requiredAction: badge.event || null,
        });
        
        // Conceder badge ao usuário
        await db.awardBadge(userId, Number(badgeId));
        newlyAwardedBadges.push(badge.id);
        
        // Criar notificação
        await db.createNotification({
          userId,
          type: "badge",
          title: `Badge Desbloqueado: ${badge.icon} ${badge.name}`,
          message: badge.description,
          relatedType: "badge",
          relatedId: Number(badgeId),
        });
      }
    }
    
    return newlyAwardedBadges;
  } catch (error) {
    console.error("[Badges] Error checking badges:", error);
    return [];
  }
}

/**
 * Verifica todos os badges para um usuário (útil para migração ou correção)
 * @param userId - ID do usuário
 * @returns Array de todos os badges desbloqueados
 */
export async function checkAllBadges(userId: number): Promise<string[]> {
  try {
    const userBadges = await db.getUserBadges(userId);
    const userBadgeIds = new Set(userBadges.map(b => b.badge.name));
    
    const newlyAwardedBadges: string[] = [];
    
    // Verificar todos os badges
    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      if (userBadgeIds.has(badge.id)) {
        continue;
      }
      
      const shouldAward = await badge.checkCondition(userId);
      
      if (shouldAward) {
        const badgeId = await db.createBadge({
          name: badge.name,
          description: badge.description,
          iconUrl: badge.icon,
          requiredAction: badge.event || null,
        });
        
        await db.awardBadge(userId, Number(badgeId));
        newlyAwardedBadges.push(badge.id);
        
        await db.createNotification({
          userId,
          type: "badge",
          title: `Badge Desbloqueado: ${badge.icon} ${badge.name}`,
          message: badge.description,
          relatedType: "badge",
          relatedId: Number(badgeId),
        });
      }
    }
    
    return newlyAwardedBadges;
  } catch (error) {
    console.error("[Badges] Error checking all badges:", error);
    return [];
  }
}
