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
    import { CancelQuery, RunQuery } from "$wailsjs/go/main/App";
    import { toast } from "svelte-sonner";
    import type { model } from "$wailsjs/go/models";

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
        <div class="flex-1 relative flex overflow-hidden bg-background">
            <!-- line numbers -->
            <div
                class="w-12 shrink-0 bg-muted/20 border-r border-border text-right text-muted-foreground select-none overflow-hidden font-mono text-sm leading-6"
            >
                <div class="py-4 pr-3">
                    {#each Array(10) as _, i}
                        <div>{i + 1}</div>
                    {/each}
                </div>
            </div>

            <!-- code area -->
            <div class="flex-1 relative font-mono text-sm leading-6">
                <textarea
                    class="absolute inset-0 w-full h-full resize-none border-0 bg-transparent p-4 pr-12 text-sm leading-5 outline-none focus:ring-0 font-mono"
                    placeholder="Write your SQL query here..."
                    bind:value={$sessions[$activeSession?.id].query}
                    >{$activeSession.query}</textarea
                >
            </div>
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
