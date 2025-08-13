import apiClient from './apiClient';

export interface FieldDictionary {
  id: string;
  name: string;
  state: string;
  type: string;
  address: string;
}

class FieldDictionaryService {
  private baseUrl = '/api/FieldDictionary';

  // Получить все поля
  async getAllFields(): Promise<FieldDictionary[]> {
    const response = await apiClient.get<FieldDictionary[]>(`${this.baseUrl}/all`);
    return response;
  }

  // Получить поля по типу игры
  async getFieldsByType(type: string): Promise<FieldDictionary[]> {
    const response = await apiClient.get<FieldDictionary[]>(`${this.baseUrl}/by-type`, {
      params: { type }
    });
    return response;
  }

  // Получить поля по штату и типу игры
  async getFieldsByStateAndType(state: string, type: string): Promise<FieldDictionary[]> {
    const response = await apiClient.get<FieldDictionary[]>(`${this.baseUrl}/by-state`, {
      params: { state, type }
    });
    return response;
  }

  // Получить уникальные штаты
  async getUniqueStates(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/states`);
    return response;
  }
}

export default new FieldDictionaryService(); 