// This file is now server-safe and can be imported anywhere.
// It no longer contains direct 'firebase/*' imports.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './auth/use-user';
export * from './errors';
export * from './error-emitter';

// We do NOT export initializeFirebase from here anymore as it contained client-side code.
// The client provider now handles initialization internally by calling a client-only function.
