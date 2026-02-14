<script lang="ts">
	import NewConnection from "$lib/components/new-connection.svelte";
	import * as Empty from "$lib/components/ui/empty";
	import { Database } from "@lucide/svelte";
	import "./app.css";
	import logo from "./assets/images/logo-universal.png";
	import Layout from "./Layout.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
    import { Toaster } from "$lib/components/ui/sonner";
    import { openModalConnection } from "./stores/app-store";
    import { activeTab } from "$stores/tab-store";
    import AppMain from "$lib/components/app-main.svelte";

	let isNewConnectionOpen: boolean = $state(false);
</script>

<Layout>
	<main class="min-h-full">
		{#if $activeTab}
		<AppMain />
		{:else}
		<Empty.Root class="min-h-full flex flex-1 items-center justify-center">
			<Empty.Header>
				<Empty.Media variant="icon">
					<Database class="size-12 text-muted-foreground" />
				</Empty.Media>
				<Empty.Title>Welcome to Queriez</Empty.Title>
				<Empty.Description>
					Get started by creating a new connection and running yout
					first query.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<div class="flex gap-2">
					<Button
						class="cursor-pointer"
						onclick={() => openModalConnection.set(true)}
						>New Connection</Button
					>
					<Button variant="outline" disabled>Import Config</Button>
				</div>
			</Empty.Content>
		</Empty.Root>
		{/if}
	</main>

	<NewConnection
		open={isNewConnectionOpen}
		onOpenChange={(open: boolean) => (isNewConnectionOpen = open)}
	/>

	<Toaster richColors expand={true} position="bottom-right" />
</Layout>

<style>
</style>
