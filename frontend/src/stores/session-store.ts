import type { Session } from "src/types";
import { derived, get, writable } from "svelte/store";

export const sessions = writable<Record<string, Session>>({});

export const activeSessionId = writable<string | null>(null);

export const activeSession = derived([sessions, activeSessionId], ([$sessions, $activeSessionId]) =>
    $activeSessionId && $sessions[$activeSessionId]
        ? ($sessions[$activeSessionId] || null)
        : null
);

// export const addSession = (id: string, poolKey: string, activeDB: string | null) => {
//     const session: Session = {
//         id,
//         poolKey,
//         activeDB,
//         query: '',
//         result: null,
//     }
//     sessions.update((sess) => ({ ...sess, [session.id]: session }));
//     activeSessionId.set(session.id);
// }

export const getSessionById = (id: string): Session | null => {
    // let session: Session | null = null;
    // sessions.update((sess) => {
    //     session = sess[id] || null;
    //     return sess;
    // });
    // return session;
    
    return get(sessions)[id] || null;
}

export const setSession = (session: Session) => {
    console.log("Setting session:", session);
    sessions.update((sess) => ({
        ...sess,
        [session.id]: session,
    }))
    console.log("Session set.", get(sessions));
};

export const updateSessionActiveDB = (sessionId: string, newPoolKey: string, database: string) => {
    const session = getSessionById(sessionId);
    if (!session) return;

    session.poolKey = newPoolKey;
    session.database = database;

    setSession(session);
};

// export const updateSessionQuery = (sessionId: string, query: string) => {
//     sessions.update((sess) => {
//         const session = sess[sessionId];
//         if (!session) return sess;

//         return {
//             ...sess,
//             [sessionId]: {
//                 ...session,
//                 query,
//             },
//         };
//     });
// };

export const removeSession = (sessionId: string) => {
    sessions.update((sess) => {
        const { [sessionId]: _, ...rest } = sess;
        return rest;
    });
};