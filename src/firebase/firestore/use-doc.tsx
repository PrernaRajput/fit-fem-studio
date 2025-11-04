'use client';

import { useEffect, useState } from 'react';
import {
  onSnapshot,
  type DocumentReference,
} from 'firebase/firestore';

export function useDoc<T>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data: T = {
            id: snapshot.id,
            ...snapshot.data(),
          };
          setData(data);
          setError(null);
        } else {
          setData(null); // Document does not exist
          setError(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
        setData(null);
        console.error(err);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, error, isLoading };
}
