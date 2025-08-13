import { CLAN_TYPES } from '../types/clan';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  airsoftClanId?: string;
  airsoftClanName?: string;
  airsoftClanRole?: string;
  paintballClanId?: string;
  paintballClanName?: string;
  paintballClanRole?: string;
  clanId?: string;
  clanName?: string;
  clanRole?: string;
}

export class ClanUtils {
  // Получить ID клана по типу
  static getUserClanId(user: User | null, clanType: string): string {
    if (!user) return '';
    
    if (clanType === CLAN_TYPES.AIRSOFT) {
      return user.airsoftClanId || '';
    } else if (clanType === CLAN_TYPES.PAINTBALL) {
      return user.paintballClanId || '';
    }
    
    return '';
  }

  // Получить название клана по типу
  static getUserClanName(user: User | null, clanType: string): string {
    if (!user) return '';
    
    if (clanType === CLAN_TYPES.AIRSOFT) {
      return user.airsoftClanName || '';
    } else if (clanType === CLAN_TYPES.PAINTBALL) {
      return user.paintballClanName || '';
    }
    
    return '';
  }

  // Получить роль в клане по типу
  static getUserClanRole(user: User | null, clanType: string): string {
    if (!user) return '';
    
    if (clanType === CLAN_TYPES.AIRSOFT) {
      return user.airsoftClanRole || '';
    } else if (clanType === CLAN_TYPES.PAINTBALL) {
      return user.paintballClanRole || '';
    }
    
    return '';
  }

  // Проверить, состоит ли пользователь в клане определенного типа
  static isUserInClan(user: User | null, clanType: string): boolean {
    return !!this.getUserClanId(user, clanType);
  }

  // Проверить, может ли пользователь вступить в клан
  static canUserJoinClan(user: User | null, clanType: string): boolean {
    return !this.isUserInClan(user, clanType);
  }

  // Проверить, может ли пользователь создать клан
  static canUserCreateClan(user: User | null, clanType: string): boolean {
    return !this.isUserInClan(user, clanType);
  }

  // Проверить, является ли пользователь лидером клана определенного типа
  static isUserLeaderOfClanType(user: User | null, clanType: string): boolean {
    return this.isUserInClan(user, clanType) && this.getUserClanRole(user, clanType) === 'Leader';
  }

  // Получить количество кланов, которыми владеет пользователь
  static getUserOwnedClansCount(user: User | null): number {
    if (!user) return 0;
    
    let count = 0;
    if (user.airsoftClanRole === 'Leader') count++;
    if (user.paintballClanRole === 'Leader') count++;
    
    return count;
  }

  // Проверить, может ли пользователь владеть еще одним кланом
  static canUserOwnAnotherClan(user: User | null): boolean {
    return this.getUserOwnedClansCount(user) < 2;
  }

  // Получить список типов кланов, в которых пользователь состоит
  static getUserClanTypes(user: User | null): string[] {
    if (!user) return [];
    
    const types: string[] = [];
    if (this.isUserInClan(user, CLAN_TYPES.AIRSOFT)) {
      types.push(CLAN_TYPES.AIRSOFT);
    }
    if (this.isUserInClan(user, CLAN_TYPES.PAINTBALL)) {
      types.push(CLAN_TYPES.PAINTBALL);
    }
    
    return types;
  }

  // Получить список типов кланов, в которые пользователь может вступить
  static getAvailableClanTypes(user: User | null): string[] {
    if (!user) return [CLAN_TYPES.AIRSOFT, CLAN_TYPES.PAINTBALL];
    
    const availableTypes: string[] = [];
    if (this.canUserJoinClan(user, CLAN_TYPES.AIRSOFT)) {
      availableTypes.push(CLAN_TYPES.AIRSOFT);
    }
    if (this.canUserJoinClan(user, CLAN_TYPES.PAINTBALL)) {
      availableTypes.push(CLAN_TYPES.PAINTBALL);
    }
    
    return availableTypes;
  }

  // Получить информацию о всех кланах пользователя
  static getUserClansInfo(user: User | null): Array<{
    type: string;
    id: string;
    name: string;
    role: string;
  }> {
    if (!user) return [];
    
    const clans: Array<{
      type: string;
      id: string;
      name: string;
      role: string;
    }> = [];
    
    if (this.isUserInClan(user, CLAN_TYPES.AIRSOFT)) {
      clans.push({
        type: CLAN_TYPES.AIRSOFT,
        id: this.getUserClanId(user, CLAN_TYPES.AIRSOFT),
        name: this.getUserClanName(user, CLAN_TYPES.AIRSOFT),
        role: this.getUserClanRole(user, CLAN_TYPES.AIRSOFT)
      });
    }
    
    if (this.isUserInClan(user, CLAN_TYPES.PAINTBALL)) {
      clans.push({
        type: CLAN_TYPES.PAINTBALL,
        id: this.getUserClanId(user, CLAN_TYPES.PAINTBALL),
        name: this.getUserClanName(user, CLAN_TYPES.PAINTBALL),
        role: this.getUserClanRole(user, CLAN_TYPES.PAINTBALL)
      });
    }
    
    return clans;
  }

  // Получить сообщение об ошибке для попытки создания/вступления в клан
  static getJoinClanErrorMessage(user: User | null, clanType: string): string | null {
    if (!user) return 'Пользователь не авторизован';
    
    if (!this.canUserJoinClan(user, clanType)) {
      return `Вы уже состоите в клане ${clanType}. Покиньте текущий клан, чтобы присоединиться к новому.`;
    }
    
    return null;
  }

  // Получить сообщение об ошибке для попытки создания клана
  static getCreateClanErrorMessage(user: User | null, clanType: string): string | null {
    if (!user) return 'Пользователь не авторизован';
    
    if (!this.canUserCreateClan(user, clanType)) {
      return `Вы уже состоите в клане ${clanType}. Покиньте текущий клан, чтобы создать новый.`;
    }
    
    if (!this.canUserOwnAnotherClan(user)) {
      return 'Вы уже владеете максимальным количеством кланов (2). Передайте лидерство в одном из кланов, чтобы создать новый.';
    }
    
    return null;
  }
} 