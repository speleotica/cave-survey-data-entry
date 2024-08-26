import { Idb } from '@/idb/idb'
import React from 'react'

export const IdbContext = React.createContext<Idb | undefined>(undefined)

export function useIdb(): Idb {
  const idb = React.useContext(IdbContext)
  if (!idb) throw new Error(`must be used inside an IdbProvider`)
  return idb
}

export function IdbProvider({
  idb,
  children,
}: {
  idb: Idb
  children: React.ReactNode
}) {
  return <IdbContext.Provider value={idb}>{children}</IdbContext.Provider>
}
