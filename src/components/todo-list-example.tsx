'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Define the type for a single todo item, matching the data in Firestore
type Todo = {
  text: string;
  completed: boolean;
};

/**
 * An example component demonstrating how to fetch a Firestore collection
 * and store the documents in an array to be rendered in the UI.
 */
export function TodoList() {
  const { user } = useUser();
  const firestore = useFirestore();

  // 1. Create a memoized reference to the Firestore collection.
  //    'useMemoFirebase' is crucial here to prevent infinite re-renders.
  //    The hook will wait until 'user' and 'firestore' are available.
  const todosCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'todos');
  }, [user, firestore]);

  // 2. Use the `useCollection` hook with the reference.
  //    `data` will be an array of your documents, or null if loading or no data.
  //    `isLoading` tells you if the data is being fetched.
  const { data: todos, isLoading } = useCollection<Todo>(todosCollectionRef);

  return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle>My Todo List</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            )}

            {!isLoading && todos && todos.length > 0 && (
                <ul className="space-y-2">
                    {/* 3. If 'todos' is an array, you can map over it to render the items */}
                    {todos.map((todo) => (
                        <li
                            key={todo.id} // The 'id' is automatically added by the hook
                            className={`p-2 rounded-md ${
                                todo.completed ? 'bg-muted text-muted-foreground line-through' : 'bg-secondary'
                            }`}
                        >
                            {todo.text}
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && (!todos || todos.length === 0) && (
                <p className="text-muted-foreground">You have no todos.</p>
            )}
        </CardContent>
    </Card>
  );
}
