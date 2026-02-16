<script lang="ts">
    import {
        Play,
        Save,
        Square,
    } from "@lucide/svelte";
    import { Button } from "./ui/button";
    import { activeTab } from "$stores/tab-store";
    import {
        activeSession,
        sessions,
    } from "$stores/session-store";
    import { connections } from "$stores/connection-store";
    import { CancelQuery, RunQuery } from "$wailsjs/go/main/App";
    import { toast } from "svelte-sonner";
    import type { model } from "$wailsjs/go/models";
    import { autocompletion } from "@codemirror/autocomplete";
    import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
    import { get } from "svelte/store";
    import { EditorState } from "@codemirror/state";
    import { defaultKeymap } from "@codemirror/commands";
    import { sql } from "@codemirror/lang-sql";

    let container = $state<HTMLDivElement | null>(null);
    let view = $state<EditorView | null>(null);
    let isSyncing = false;
    let currentSessionId = $derived($activeSession?.id ?? null);
    const SQL_KEYWORDS = [
        "SELECT",
        "FROM",
        "WHERE",
        "JOIN",
        "LEFT",
        "RIGHT",
        "INNER",
        "OUTER",
        "GROUP BY",
        "ORDER BY",
        "LIMIT",
        "INSERT",
        "UPDATE",
        "DELETE",
        "VALUES",
        "CREATE",
        "ALTER",
        "DROP",
    ];
    const SQL_KEYWORD_SET = new Set(SQL_KEYWORDS);
    const getTableNames = () => {
        const session = get(activeSession);
        if (!session) return [];
        const connection = get(connections)[session.connectionId];
        if (!connection) return [];
        const database = connection.databases.find(
            (db) => db.name === session.database,
        );
        return database?.tables ?? [];
    };
    const editorTheme = EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
        ".cm-content": { padding: "12px", fontSize: "12px", lineHeight: "1.5" },
        ".cm-gutters": { backgroundColor: "transparent", borderRight: "1px solid var(--border)" },
    });

    $effect(() => {
        if (!container) return;
        const active = get(activeSession);
        const initialValue = active ? get(sessions)[active.id]?.query ?? "" : "";

        const state = EditorState.create({
            doc: initialValue,
            extensions: [
                keymap.of(defaultKeymap),
                lineNumbers(),
                highlightActiveLineGutter(),
                sql(),
                EditorView.lineWrapping,
                editorTheme,
                autocompletion({
                    override: [
                        (context) => {
                            const word = context.matchBefore(/\w*/);
                            if (!word || (word.from === word.to && !context.explicit)) {
                                return null;
                            }
                            const unique = new Set([...SQL_KEYWORDS, ...getTableNames()]);
                            const options = Array.from(unique).map((label) => ({
                                label,
                                type: SQL_KEYWORD_SET.has(label) ? "keyword" : "class",
                            }));
                            return {
                                from: word.from,
                                options,
                            };
                        },
                    ],
                }),
                EditorView.updateListener.of((update) => {
                    if (!update.docChanged || isSyncing) return;
                    const sessionId = currentSessionId;
                    if (!sessionId) return;
                    sessions.update((sess) => {
                        const session = sess[sessionId];
                        if (!session) return sess;
                        const nextValue = update.state.doc.toString();
                        if (session.query === nextValue) return sess;
                        return {
                            ...sess,
                            [sessionId]: {
                                ...session,
                                query: nextValue,
                            },
                        };
                    });
                }),
            ],
        });

        const localView = new EditorView({
            state,
            parent: container,
        });

        view = localView;

        return () => {
            localView.destroy();
            if (view === localView) view = null;
        };
    });

    $effect(() => {
        if (!view) return;
        const session = $activeSession;
        const storeValue = session ? $sessions[session.id]?.query ?? "" : "";
        const currentValue = view.state.doc.toString();
        if (currentValue !== storeValue) {
            isSyncing = true;
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: storeValue },
            });
            isSyncing = false;
        }
    });

    const runQuery = async (sessionID: string, query: string) => {
        // Implement query execution logic here
        console.log("Running query...");

        $sessions[sessionID].status = "running";

        await RunQuery(sessionID, query)
            .then((results) => {
                console.log("Query result:", results);
                // Update session store with results
                $sessions[sessionID].results = results;
                $sessions[sessionID].status = "done";
            })
            .catch((err) => {
                console.error("Error running query:", err);
                $sessions[sessionID].status = "error";
                toast.error(`${err}`);
            });
    };

    const cancelQuery = async (sessionID: string) => {
        // Implement query cancellation logic here
        console.log("Cancelling query...");
        await CancelQuery(sessionID)
            .then(() => {
                console.log("Query cancelled");
                $sessions[sessionID].status = "cancelled";
            })
            .catch((err) => {
                console.error("Error cancelling query:", err);
                toast.error(`${err}`);
            });
    };
</script>

<div class="flex flex-col h-full">
    {#if $activeTab && $activeSession}
        <!-- Editor area -->
        <div class="flex-1 min-h-0 relative flex overflow-hidden bg-background">
            <div bind:this={container} class="w-full h-full"></div>
        </div>

        <div
            class="flex items-center justify-between px-3 border-t bg-muted/30 relative h-12"
        >
            <div class="flex items-center gap-3">
                {#if $sessions[$activeSession.id].status !== "running"}
                <Button
                    size="sm"
                    class="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded transition-colors shadow-sm cursor-pointer"
                    onclick={() => runQuery($activeSession.id, $activeSession.query)}
                    disabled={$sessions[$activeSession.id].status ===
                        "running" ||
                        $sessions[$activeSession.id].query.trim() === ""}
                >
                    <Play class="w-3 h-3 fill-current" /> Run
                </Button>
                {:else}
                <Button
                    size="sm"
                    class="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded transition-colors shadow-lg shadow-red-900/20 animate-pulse cursor-pointer"
                    onclick={() => cancelQuery($activeSession.id)}
                >
                    <Square class="w-3.5 h-3.5 fill-current" /> Stop
                </Button>
                {/if}

                <Button
                    size="sm"
                    class="flex items-center gap-2 px-3 py-1.5 bg-background border border-border hover:bg-accent hover:text-accent-foreground text-muted-foreground text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save class="w-3 h-3 fill-current" /> Save
                </Button>
            </div>
        </div>
    {:else}
        <div
            class="flex-1 flex items-center justify-center text-muted-foreground"
        >
            No active session. Please create or select a connection.
        </div>
    {/if}
</div>
