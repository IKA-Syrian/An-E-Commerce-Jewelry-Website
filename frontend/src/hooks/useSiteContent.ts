import { useState, useEffect } from 'react';
import siteContentService, { SiteContent } from '../services/siteContentService';

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await siteContentService.getAll();
        setContent(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch site content'));
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
}

export function useSiteContentByKey(contentKey: string | null) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contentKey) {
      setContent(null);
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await siteContentService.getByKey(contentKey);
        setContent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch site content'));
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentKey]);

  return { content, loading, error };
} 