<script lang="ts">
    import { X } from "@lucide/svelte";
    import Badge from "../badge/badge.svelte";
    import { cn } from "$lib/utils";

    let el: HTMLElement | null = null;
    let prevActive = false;

    let { 
        // ref = $bindable(null), 
        class: className,
        active = false,
        children, 
        onClick = undefined,
        onClose = undefined, 
        ...restProps 
    } = $props<{
        // ref?: HTMLElement | null;
        class?: string;
        active?: boolean;
        children?: () => unknown;
        onClick?: () => void;
        onClose?: () => void;
    }>();

    // let mounted = false;
    $effect(() => {
        // if (!mounted) {
        //     mounted = true;
        //     return;
        // }

        if (active && !prevActive && el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
        prevActive = active;
    })

    function handleCLose(e: MouseEvent) {
        e.stopPropagation();
        onClose?.();
    }
</script>

<div bind:this={el}>
    <Badge
        variant="outline"
        class={cn("rounded-md px-2.5 py-1.5 text-sm cursor-pointer hover:bg-gray-200", className)}
        onclick={() => onClick?.()}
        {...restProps}
    >
        {@render children?.()}
    
        {#if onClose}
        <button
            class="hover:bg-transparent p-0 m-0 cursor-pointer"
            onclick={handleCLose}
        >
            <X class="h-3.5 w-3.5" />
        </button>
        {/if}
    </Badge>
</div>
