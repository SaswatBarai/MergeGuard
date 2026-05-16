import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateJobProgress } from '@/store/reviewSlice';

export const useReviewStream = (jobId: number | null) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!jobId) return;

    setStatus('connecting');
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${jobId}/stream`);

    eventSource.onopen = () => {
      setStatus('connected');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(updateJobProgress({ jobId, progress: data }));
    };

    eventSource.onerror = () => {
      setStatus('disconnected');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, dispatch]);

  return { status };
};
