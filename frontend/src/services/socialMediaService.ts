import api from '../lib/api';

export interface SocialMediaLink {
  link_id?: number;
  platform_name: string;
  url: string;
  icon_class?: string;
  display_order?: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const socialMediaService = {
  getAll: async (): Promise<SocialMediaLink[]> => {
    const response = await api.get('/social-media-links');
    return response.data;
  },

  getById: async (id: number): Promise<SocialMediaLink> => {
    const response = await api.get(`/social-media-links/${id}`);
    return response.data;
  }
};

export default socialMediaService; 