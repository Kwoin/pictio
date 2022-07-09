<script>
  import { fly } from "svelte/transition"
</script>

<aside class="left">
<slot name="left"></slot>
</aside>
<main in:fly={{ x:-400 }} out:fly={{ x: 400 }}>
    <slot name="main"></slot>
</main>
<aside class="right">
    <slot name="right"></slot>
</aside>

<style>
    .left {
        grid-area: lft;
        display: flex;
    }

    .right {
        grid-area: rgt;
        display: flex;
    }

    main {
        grid-area: ctn;
        display: flex;
        overflow: auto;
    }
</style>
