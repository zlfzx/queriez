
import type { model } from "$wailsjs/go/models";

export interface ConnectionConfig {
    driver: string;
    host: string;
    port: string;
    user: string;
    pass: string;
    db: string;
    ssl?: boolean;
}

export interface Connection {
    id: string;
    // poolKey: string;
    name: string;
    config: ConnectionConfig;
    databases: Database[];
}

export interface Database {
    name: string;
    tables: string[];
}

export interface QueryResult {
    columns: string[];
    rows: any[];
    rowsAffected: number;
    lastInsertId: number;
}

export interface Session {
    id: string;
    connectionId: string;
    poolKey: string;
    database: string;
    query: string;
    status: 'idle' | 'running' | 'done' | 'error' | 'cancelled';
    results?: model.SQLResult[];
    error?: string;
}

export interface Tab {
    id: string;
    title: string;
    isDirty: boolean;
    orientation: 'horizontal' | 'vertical';
}