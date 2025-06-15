import api from '../lib/api';

export interface SiteContent {
  content_id?: number;
  content_key: string;
  title?: string;
  content_value: string;
  createdAt?: string;
  updatedAt?: string;
}

const siteContentService = {
  getAll: async (): Promise<SiteContent[]> => {
    const response = await api.get('/site-content');
    return response.data;
  },

  getByKey: async (key: string): Promise<SiteContent> => {
    const response = await api.get(`/site-content/${key}`);
    return response.data;
  }
};

export default siteContentService; 