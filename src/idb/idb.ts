import { openDB, DBSchema, IDBPDatabase } from 'idb'
import once from 'lodash/once'

export type Idb = IDBPDatabase<MyDB>

interface MyDB extends DBSchema {
  pageImages: {
    key: string
    value: File
  }
}

const migrations = [
  (db: IDBPDatabase) => {
    db.createObjectStore('pageImages')
  },
]

export const createIdb = once(async function createIdb() {
  return await openDB<MyDB>('my-db', migrations.length + 1, {
    upgrade(db, oldVersion) {
      for (const migration of migrations.slice(oldVersion - 1)) {
        migration(db as any)
      }
    },
  })
})
