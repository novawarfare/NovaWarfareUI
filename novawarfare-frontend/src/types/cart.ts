export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
  missionId?: string;
  gameType?: string;
  difficulty?: number;
  terrain?: string;
} 