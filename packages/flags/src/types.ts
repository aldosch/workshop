export interface FlagDefinition {
  description: string;
  defaultValue: boolean;
}

export interface FlagContext {
  userId?: string;
  environment?: "development" | "preview" | "production";
}
