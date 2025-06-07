/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOTTERY_ADDRESS: string
  readonly VITE_GANACHE_URL?: string
  readonly VITE_NETWORK_ID?: string
  readonly VITE_DEBUG_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}