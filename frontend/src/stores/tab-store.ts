import type { Tab } from "src/types";
import { writable, derived, get } from "svelte/store";
import { activeSession, activeSessionId, sessions } from "./session-store";

export const tabs = writable<Record<string, Tab>>({});

export const activeTabId = writable<string | null>(null);

export const activeTab = derived([tabs, activeTabId], ([$tabs, $activeTabId]) =>
    $activeTabId && $tabs[$activeTabId]
        ? ($tabs[$activeTabId] || null)
        : null
);

// add a new tab handler
export const addNewTab = (
    id: string | null = null, 
    connectionId: string | null = null,
    poolKey: string | null = null, 
    database: string | null = null
) => {
    if (!id) id = crypto.randomUUID();
    
    const tab = get(activeTab);
    tabs.update((ts) => {
        return {
            ...ts,
            [id]: {
                id: id,
                title: "New Query",
                isDirty: true,
                orientation: tab?.orientation || 'vertical'
            }
        };
    });
    activeTabId.set(id);
    
    if (!connectionId && !poolKey && !database) {
        const session = get(activeSession);
        if (session) {
            connectionId = session.connectionId;
            poolKey = session.poolKey;
            database = session.database;
        }
    }

    sessions.update((sess) => {
        return {
            ...sess,
            [id]: {
                id: id,
                connectionId: connectionId || '',
                poolKey: poolKey || '',
                database: database || '',
                query: '',
                status: 'idle',
                result: undefined,
                error: undefined,
            },
        }
    });
    activeSessionId.set(id);

    return true;
}

export const setActiveTab = (tabId: string) => {
    activeTabId.set(tabId);
    activeSessionId.set(tabId);
    console.log("Active tab set to:", tabId);
};

export const closeTab = (tabId: string) => {
    const currentTabs = get(tabs);
    const ids = Object.keys(currentTabs);

    if (!currentTabs[tabId]) return; // Tab doesn't exist

    const idx = ids.indexOf(tabId);
    const isActive = get(activeTabId) === tabId;

    let nextActiveTabId: string | null = get(activeTabId);

    if (isActive) {
        nextActiveTabId =
            ids[idx + 1] ?? // Try to activate the next tab
            ids[idx - 1] ?? // Or the previous tab
            null;

        // Update active tab if needed
        // activeTabId.set(nextActiveTabId);
        setActiveTab(nextActiveTabId);
    }

    // Remove the tab
    tabs.update((ts) => {
        const { [tabId]: _, ...rest } = ts;
        return rest;
    });
};

export const setTabOrientation = (
    tabId: string, 
    orientation: 'horizontal' | 'vertical'
) => {
    tabs.update((ts) => {
        const tab = ts[tabId];
        if (!tab) return ts;

        return {
            ...ts,
            [tabId]: {
                ...tab,
                orientation,
            },
        };
    });
};

// export const setActiveDB = (tabId: string, activeDB: string | null) => {
//     const tab = get(tabs)[tabId];
//     if (!tab) return;

//     tab.session.activeDB = activeDB;

//     tabs.update((ts) => ({
//         ...ts,
//         [tabId]: tab,
//     }));
// };