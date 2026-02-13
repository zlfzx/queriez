<script>
    import { activeSession } from "$stores/session-store";
    import { ClockFading, Grid2x2Check, Table as TableIcon } from "@lucide/svelte";
    import * as Empty from "./ui/empty";
    import * as Table from "./ui/table";
    import * as Tabs from "./ui/tabs";
    import * as Tooltip from "./ui/tooltip";
    import { Button } from "./ui/button";
</script>

<div class="h-full flex flex-col">
    {#if $activeSession && $activeSession.results}
        <Tabs.Root value="result-0" class="w-full h-full flex-1 gap-0">
            {#if $activeSession.results.length > 1}
            <Tabs.List class="m-2">
                {#each $activeSession.results as _, index }
                <Tabs.Trigger value="result-{index}">Result {index + 1}</Tabs.Trigger>
                {/each}
            </Tabs.List>
            {/if}

            {#each $activeSession.results as result, index }
            <Tabs.Content value="result-{index}" class="h-full flex flex-col">
                <!-- Content for Result {index + 1} -->
                {#if !result.error}
                <div class="flex-1 overflow-x-auto overflow-y-auto">
                    <Table.Root class="min-w-full">
                        <Table.Header class="sticky top-0 bg-background">
                            <Table.Row>
                                {#each result.columns as column}
                                    <Table.Head>{column}</Table.Head>
                                {/each}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each result.rows as row}
                                <Table.Row>
                                    {#each row as data}
                                        <Table.Cell>{data}</Table.Cell>
                                    {/each}
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
                {:else}
                <div class="flex-1 flex items-center justify-center p-4">
                    <p class="text-red-400">{result.error}</p>
                </div>
                {/if}

                <div class="flex items-center justify-between px-4 py-2 border-t bg-muted/30 relative h-12">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tooltip.Provider delayDuration={0}>
                            <Tooltip.Root>
                                <Tooltip.Trigger class="flex items-center">
                                    <p class="mr-1">{result.rows ?  result.rows.length : 0}</p> <TableIcon class="inline size-4" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>Return {result.rows ?  result.rows.length : 0} rows</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Tooltip.Provider delayDuration={0}>
                            <Tooltip.Root>
                                <Tooltip.Trigger class="flex items-center">
                                    <p class="mr-1">{result.affected_rows ?? 0}</p> <Grid2x2Check class="inline size-4" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>Affected {result.affected_rows ?? 0} rows</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Tooltip.Provider delayDuration={0}>
                            <Tooltip.Root>
                                <Tooltip.Trigger class="flex items-center">
                                    <p class="mr-1">{(result.execution_time ?? 0) * 1000}ms</p> <ClockFading class="inline size-4" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>Execution time {(result.execution_time ?? 0) * 1000} ms</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>

                    <Button size="sm" variant="outline" onclick={() => { navigator.clipboard.writeText(JSON.stringify(result.rows)); }}>
                        Copy Rows
                    </Button>
                </div>
            </Tabs.Content>
            {/each}
        </Tabs.Root>
    {:else}
        <Empty.Root class="min-h-full flex flex-1 items-center justify-center">
            <Empty.Header>
                <!-- <Empty.Media variant="icon">
                <Database class="size-12 text-muted-foreground" />
            </Empty.Media> -->
                <Empty.Title>No query results</Empty.Title>
                <Empty.Description>
                    Run a query to see results here.
                </Empty.Description>
            </Empty.Header>
            <!-- <Empty.Content>
            <div class="flex gap-2">
                <Button
                    class="cursor-pointer"
                    onclick={() => openModalConnection.set(true)}
                    >New Connection</Button
                >
                <Button variant="outline" disabled>Import Config</Button>
            </div>
        </Empty.Content> -->
        </Empty.Root>
    {/if}
</div>
