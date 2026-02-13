<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    import * as Resizable from "$lib/components/ui/resizable";
    import {
        activeSession,
        getSessionById,
        updateSessionActiveDB,
    } from "$stores/session-store";
    import { activeTab, setTabOrientation } from "$stores/tab-store";
    import QueryEditor from "./query-editor.svelte";
    import ResultTable from "./result-table.svelte";
    import { connections } from "$stores/connection-store";
    import {
        Server,
        Database,
        SquareSplitHorizontal,
        SquareSplitVertical,
    } from "@lucide/svelte";
    import Button from "./ui/button/button.svelte";
    import { SetActiveDatabase } from "$wailsjs/go/main/App";

    let connectionId = $derived($activeSession?.connectionId || "");

    let valueConnection = $derived($activeSession?.connectionId || "");
    let selectedConnection = $derived(
        $connections[valueConnection]?.name || "Select Connection",
    );

    // let valueDatabase = $derived($activeSession?.activeDB || "");
    let selectedDatabase = $derived(
        $connections[connectionId]?.databases.find(
            (db) => db.name === $activeSession?.database,
        )?.name || "Select Database",
    );

    const selectDatabase = async (sessionID: string, dbName: string) => {
        const sess = getSessionById(sessionID);
        if (!sess) return;

        await SetActiveDatabase(sessionID, dbName)
            .then((newPoolKey) => {
                console.log("Database switched to", dbName, newPoolKey);
                updateSessionActiveDB(sessionID, newPoolKey, dbName);
            })
            .catch((err) => {
                console.error("Error switching database:", err);
            });
    };
</script>

{#if $activeTab && $activeSession}
    <div class="flex flex-col h-full bg-background">
        <div
            class="flex items-center justify-between gap-3 p-2 border-b bg-muted/30 z-20 relative"
        >
            <div class="flex items-center gap-3">
                <!-- Select Connection -->
                <Select.Root type="single" bind:value={valueConnection}>
                    <Select.Trigger
                        size="sm"
                        class="w-56 rounded bg-white cursor-pointer focus:outline-none focus:ring-0 focus:ring-ring focus:border-input"
                    >
                        <Server size={16} aria-hidden="true" />
                        <span>{selectedConnection}</span>
                    </Select.Trigger>
                    <Select.Content>
                        {#each Object.values($connections) as connection}
                            <Select.Item value={connection.id}
                                >{connection.name}</Select.Item
                            >
                        {/each}
                        <!-- <Select.Item value="light">Light</Select.Item>
                    <Select.Item value="dark">Dark</Select.Item>
                    <Select.Item value="system">System</Select.Item> -->
                    </Select.Content>
                </Select.Root>

                <!-- Select Database -->
                <Select.Root
                    type="single"
                    onValueChange={(val) =>
                        selectDatabase($activeSession.id, val)}
                >
                    <Select.Trigger
                        size="sm"
                        class="w-56 rounded bg-white cursor-pointer focus:outline-none focus:ring-0 focus:ring-ring focus:border-input"
                    >
                        <Database size={16} aria-hidden="true" />
                        <span>{selectedDatabase}</span>
                    </Select.Trigger>
                    <Select.Content>
                        {#each Object.values($connections[connectionId]?.databases || []) as database}
                            <Select.Item value={database.name}
                                >{database.name}</Select.Item
                            >
                        {/each}
                        <!-- <Select.Item value="light">Light</Select.Item>
                    <Select.Item value="dark">Dark</Select.Item>
                    <Select.Item value="system">System</Select.Item> -->
                    </Select.Content>
                </Select.Root>
            </div>

            <Button
                size="icon"
                variant="outline"
                class="cursor-pointer"
                title={$activeTab?.orientation === "vertical"
                    ? "Toggle editor orientation horizontally"
                    : "Toggle editor orientation vertically"}
                onclick={() => {
                    setTabOrientation(
                        $activeTab.id,
                        $activeTab?.orientation === "vertical"
                            ? "horizontal"
                            : "vertical",
                    );
                    console.log("activeTab", $activeTab);
                }}
            >
                {#if $activeTab?.orientation === "vertical"}
                    <SquareSplitHorizontal class="w-4 h-4" />
                {:else}
                    <SquareSplitVertical class="w-4 h-4" />
                {/if}
            </Button>
        </div>
        <Resizable.PaneGroup
            direction={$activeTab.orientation ?? "vertical"}
            class="bg-white"
        >
            <Resizable.Pane minSize={20} defaultSize={50} class="max-h-full">
                <QueryEditor />
            </Resizable.Pane>
            <Resizable.Handle withHandle class="cursor-row-resize" />
            <Resizable.Pane minSize={20} defaultSize={50}>
                <ResultTable />
            </Resizable.Pane>
        </Resizable.PaneGroup>
    </div>
{/if}
