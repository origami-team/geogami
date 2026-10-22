import { Storage } from '@ionic/storage-angular';

// Ionic Storage 4 does not open its database by itself: `get`, `set` and `remove` throw
// ("Database not created. Must call create() first") until create() has finished. This
// runs once before the app starts (APP_INITIALIZER), so by the time anything uses the
// storage - the language service, the clean-up of old game data - it is ready.
//
// If the browser refuses to open its storage the app must still start: it then runs
// without saved preferences, and the services that use the storage cope with it failing.
export function initializeStorage(storage: Storage): () => Promise<void> {
  return async () => {
    try {
      await storage.create();
    } catch (error) {
      console.warn('Could not open the browser storage, continuing without it:', error);
    }
  };
}
