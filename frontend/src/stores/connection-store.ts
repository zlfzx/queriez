import type { Connection } from "src/types";
import { writable } from "svelte/store";

export const connections = writable<Record<string, Connection>>({});


export const addConnection = (connection: Connection) => {
    connections.update((conns) => ({
        ...conns,
        [connection.id]: connection,
    }))
};