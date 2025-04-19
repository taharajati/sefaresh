declare module 'better-sqlite3' {
  namespace Database {
    interface Database {
      exec(sql: string): void;
      prepare<T = any>(sql: string): Statement<T>;
      transaction<T extends Function>(cb: T): T;
      pragma(source: string, options?: { simple?: boolean }): any;
      checkpoint(databaseName?: string): void;
      function(name: string, cb: Function): void;
      aggregate(name: string, options: { start?: any, step: Function, result?: Function }): void;
      loadExtension(path: string): void;
      close(): void;
      readonly name: string;
      readonly open: boolean;
      readonly inTransaction: boolean;
      readonly readonly: boolean;
      readonly memory: boolean;
    }

    interface Statement<T = any> {
      run(...params: any[]): RunResult;
      get(...params: any[]): T;
      all(...params: any[]): T[];
      iterate(...params: any[]): IterableIterator<T>;
      pluck(toggleState?: boolean): this;
      expand(toggleState?: boolean): this;
      raw(toggleState?: boolean): this;
      bind(...params: any[]): this;
      columns(): ColumnDefinition[];
      readonly: boolean;
    }

    interface ColumnDefinition {
      name: string;
      column: string | null;
      table: string | null;
      database: string | null;
      type: string | null;
    }

    interface RunResult {
      changes: number;
      lastInsertRowid: number | bigint;
    }
  }

  function Database(filename: string, options?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: Function;
  }): Database.Database;

  export = Database;
} 