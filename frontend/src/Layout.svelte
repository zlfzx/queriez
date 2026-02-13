<script lang="ts">
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { TabItem } from "$lib/components/ui/tab-item";
    import { activeSessionId } from "$stores/session-store";
    import { activeTabId, addNewTab, closeTab, setActiveTab, tabs } from "$stores/tab-store";
    import { Plus } from "@lucide/svelte";
    import { NewTab } from "$wailsjs/go/main/App";

    let { children } = $props<{ children?: () => any }>();

    let tabList = $derived(Object.values($tabs));

    const newTab = async () => {
        const sessionId = $activeSessionId;
        if (!sessionId) return;

        console.log("Creating new tab for session:", sessionId);
        await NewTab(sessionId).then((connect) => {
            console.log("New session created:", connect);
            addNewTab(connect.session_id);
        });
    }
</script>

<Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset class="overflow-x-hidden">
        <header
            class="flex h-16x shrink-0 items-center gap-2 border-b py-2 px-4"
        >
            <Sidebar.Trigger class="-ms-1" />
            <Separator
                orientation="vertical"
                class="data-[orientation=vertical]:h-4"
            />

            <!-- tab bar -->
            <div
                class="flex flex-1 items-center gap-1 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
            >
                {#each tabList as tab (tab.id)}
                    <TabItem
                        class={tab.id === $activeTabId
                            ? "bg-primary text-primary-foreground hover:bg-primary/80"
                            : ""}
                        active={tab.id === $activeTabId}
                        onClick={() => setActiveTab(tab.id)}
                        onClose={() => closeTab(tab.id)}
                    >
                        {tab.title}
                    </TabItem>
                {/each}
                <!-- {#each Array(4) as _, index}
                    <TabItem class="" onClose={() => console.log("Close tab")}>
                        New Query {index + 1}
                    </TabItem>
                {/each} -->
            </div>

            <Separator
                orientation="vertical"
                class="data-[orientation=vertical]:h-4"
            />
            <Button
                variant="default"
                size="sm"
                class="border-none cursor-pointer"
                onclick={() => newTab()}
                disabled={tabList.length === 0}
            >
                <Plus class="h-4 w-4" />
            </Button>
        </header>
        <div class="bg-muted flex flex-1 flex-col gap-4 p-2.5">
            {@render children?.()}
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
