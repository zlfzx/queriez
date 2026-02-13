<script lang="ts">
    import * as Dialog from "./ui/dialog";
    import * as Field from "./ui/field";
    import Input from "./ui/input/input.svelte";
    import Button, { buttonVariants } from "./ui/button/button.svelte";
    import { toast } from "svelte-sonner";
    import type {
        Connection,
        ConnectionConfig,
        Database,
        Tab,
    } from "src/types";
    import { openModalConnection } from "$stores/app-store";
    import { addConnection, connections } from "$stores/connection-store";
    import { activeTab, activeTabId, addNewTab } from "$stores/tab-store";
    import { Connect, TestConnect } from "$wailsjs/go/main/App";
    import * as Select from "$lib/components/ui/select";
    import type { model } from "$wailsjs/go/models";

    let props = $props();

    let driver: string = $state("mysql");
    let connectionName: string = $state("");
    let host: string = $state("localhost");
    let port: string = $state("3306");
    let user: string = $state("toor");
    let pass: string = $state("root");
    let db: string = $state("");

    async function handleConnect(event: Event) {
        event.preventDefault();
        // Handle form submission logic here
        console.log("Connecting to database...");

        const config: ConnectionConfig = { driver, host, port, user, pass, db };

        await Connect(JSON.stringify(config))
            .then(async (connect) => {
                console.log("session", connect);

                const connection: Connection = {
                    id: crypto.randomUUID(),
                    // poolKey: connect.pool_key,
                    name: connectionName,
                    config,
                    databases: [],
                };

                connect.databases.forEach((database) => {
                    const db: Database = {
                        name: database.name,
                        tables: [],
                    };
                    connection.databases.push(db);
                });

                // Add connection to the store
                addConnection(connection);
                console.log("connections", $connections);

                // add new tab and session
                addNewTab(
                    connect.session_id,
                    connection.id,
                    connect.pool_key,
                    connect.database,
                );

                // Close the modal
                openModalConnection.set(false);

                toast.success("Connection added successfully!");
                console.log("activeTab", $activeTab, $activeTabId);
            })
            .catch((error) => {
                console.log("Connection failed:", error);
                toast.error(`Connection failed: ${error}`);
            });
    }

    async function handleTestConnect() {
        console.log("Testing connection...");

        const config: ConnectionConfig = { driver, host, port, user, pass, db };
        await TestConnect(JSON.stringify(config))
            .then(() => {
                toast.success("Connection successful!");
            })
            .catch((error) => {
                console.log("Connection test failed:", error);
                toast.error(`Connection failed: ${error}`);
            });
    }
</script>

<Dialog.Root bind:open={$openModalConnection} {...props}>
    <Dialog.Content class="sm:max-w-xl max-w-full p-0">
        <Dialog.Header class="p-6">
            <Dialog.Title class="flex items-center gap-2"
                >New Connection</Dialog.Title
            >
            <Dialog.Description>
                Connect to a new database to get started.
            </Dialog.Description>
        </Dialog.Header>
        <form onsubmit={handleConnect}>
            <div class="overflow-y-auto max-h-[60vh] px-6 pb-6">
                <Field.Group>
                    <Field.Field>
                        <Field.Label for="connectionName"
                            >Connection Name</Field.Label
                        >
                        <Input
                            id="connectionName"
                            bind:value={connectionName}
                            placeholder="My Localhost"
                            required
                        />
                    </Field.Field>
                    <Field.Field>
                        <Field.Label for="driver">Database Driver</Field.Label>
                        <Select.Root type="single" bind:value={driver}>
                            <Select.Trigger
                                class="w-full rounded bg-white cursor-pointer focus:outline-none focus:ring-0 focus:ring-ring focus:border-input"
                            >
                                <span class="capitalize">{driver}</span>
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="mysql">MySQL</Select.Item>
                                <Select.Item value="postgres"
                                    >PostgreSQL</Select.Item
                                >
                                <Select.Item value="sqlite">SQLite</Select.Item>
                                <Select.Item value="mssql" disabled
                                    >SQL Server</Select.Item
                                >
                            </Select.Content>
                        </Select.Root>
                    </Field.Field>
                    <div class="grid grid-cols-4 gap-4">
                        <div class="col-span-3">
                            <Field.Field>
                                <Field.Label for="host">Host</Field.Label>
                                <Input
                                    id="host"
                                    bind:value={host}
                                    placeholder="localhost"
                                    required
                                />
                            </Field.Field>
                        </div>
                        <div class="col-span-1">
                            <Field.Field>
                                <Field.Label for="port">Port</Field.Label>
                                <Input
                                    id="port"
                                    type="number"
                                    min="0"
                                    max="65535"
                                    bind:value={port}
                                    placeholder="5432"
                                    required
                                />
                            </Field.Field>
                        </div>
                        <div class="col-span-2">
                            <Field.Field>
                                <Field.Label for="user">User</Field.Label>
                                <Input
                                    id="user"
                                    bind:value={user}
                                    placeholder="root"
                                />
                            </Field.Field>
                        </div>
                        <div class="col-span-2">
                            <Field.Field>
                                <Field.Label for="password"
                                    >Password</Field.Label
                                >
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    bind:value={pass}
                                />
                            </Field.Field>
                        </div>
                    </div>
                    <Field.Field>
                        <Field.Label for="database">Database</Field.Label>
                        <Input
                            id="database"
                            bind:value={db}
                            placeholder="(optional)"
                        />
                    </Field.Field>
                </Field.Group>
            </div>
            <Dialog.Footer class="p-6 flex sm:justify-between">
                <Dialog.Close
                    type="button"
                    class={buttonVariants({ variant: "outline" })}
                >
                    Cancel
                </Dialog.Close>
                <div class="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        class="cursor-pointer"
                        onclick={handleTestConnect}
                    >
                        Test
                    </Button>
                    <Button type="submit" class="cursor-pointer">
                        Connect
                    </Button>
                </div>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
