import { useState, useEffect } from 'react';
import socialMediaService, { SocialMediaLink } from '../services/socialMediaService';

export function useSocialMedia() {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        setLoading(true);
        const data = await socialMediaService.getAll();
        setSocialLinks(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch social media links'));
        setSocialLinks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  return { socialLinks, loading, error };
}

export function useSocialMediaById(linkId: number | null) {
  const [socialLink, setSocialLink] = useState<SocialMediaLink | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!linkId) {
      setSocialLink(null);
      setLoading(false);
      return;
    }

    const fetchSocialLink = async () => {
      try {
        setLoading(true);
        const data = await socialMediaService.getById(linkId);
        setSocialLink(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch social media link'));
        setSocialLink(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLink();
  }, [linkId]);

  return { socialLink, loading, error };
} 