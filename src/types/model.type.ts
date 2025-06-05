export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
  strengths?: string;
}

export interface Provider {
  id: string;
  name: string;
  models: Model[];
}
