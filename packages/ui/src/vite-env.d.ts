/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_COMMIT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
