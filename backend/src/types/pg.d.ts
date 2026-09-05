declare module 'pg' {
  export type QueryResultRow = Record<string, unknown>;

  export class Pool {
    constructor(config?: { connectionString?: string });
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<{
      rows: T[];
      rowCount: number | null;
    }>;
    on(event: string, listener: (error: Error) => void): this;
  }
}