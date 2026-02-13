<script lang="ts">
    import type { ComponentProps } from "svelte";
    import * as Sidebar from "./ui/sidebar";
    import Button from "./ui/button/button.svelte";
    import { ChevronRightIcon, Database, Plus, Server } from "@lucide/svelte";
    import Input from "./ui/input/input.svelte";
    import * as Collapsible from "./ui/collapsible";
    import { openModalConnection } from "$stores/app-store";
    import { connections } from "$stores/connection-store";

    let {
        ref = $bindable(null),
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
    <Sidebar.Group>
        <Sidebar.GroupContent>
            <Button
                class="w-full cursor-pointer"
                onclick={() => openModalConnection.set(true)}
            >
                <Plus class="size-4" />
                New Connection
            </Button>
        </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Input
                    placeholder="Search..."
                    class="w-full bg-white outline-none focus:ring-0 focus-visible:ring-0"
                />

                <Sidebar.GroupLabel>Connections</Sidebar.GroupLabel>
                <Sidebar.Menu>
                    {#each Object.values($connections) as connection}
                        <Sidebar.MenuItem>
                            <Collapsible.Root class="group/explorer">
                                <Collapsible.Trigger class="w-full">
                                    <Sidebar.MenuButton>
                                        <ChevronRightIcon
                                            class="transition-transform duration-200 group-data-[state=open]/explorer:rotate-90"
                                        />
                                        <Server />
                                        {connection.name}
                                    </Sidebar.MenuButton>
                                </Collapsible.Trigger>
                                <Collapsible.Content>
                                    <Sidebar.MenuSub>
                                        {#each Object.values(connection.databases) as database}
                                            <Sidebar.MenuItem>
                                                <Sidebar.MenuButton class="pl-10x">
                                                    <Database size={16} aria-hidden="true" />
                                                    {database.name}
                                                </Sidebar.MenuButton>
                                            </Sidebar.MenuItem>
                                        {/each}
                                    </Sidebar.MenuSub>
                                </Collapsible.Content>
                            </Collapsible.Root>
                        </Sidebar.MenuItem>
                    {:else}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton>
                                <span
                                    class="text-xs italic text-muted-foreground"
                                >
                                    No connections found
                                </span>
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
</Sidebar.Root>
