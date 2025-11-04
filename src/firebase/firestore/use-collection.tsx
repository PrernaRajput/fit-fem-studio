'use client';

import { useEffect, useState } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';

export function useCollection<T>(q: Query<T> | CollectionReference<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: T[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
        setData(null);
        console.error(err);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, error, isLoading };
}
