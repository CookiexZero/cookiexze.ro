interface ImportMetaEnv {
  readonly PUBLIC_DISCORD_ID: string;
  readonly PUBLIC_GITHUB_USER: string;
  readonly PUBLIC_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
