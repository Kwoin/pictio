<script>

  import { Link } from "svelte-routing";
  import { slide, fly } from "svelte/transition";

  let transition1Done = false;

</script>

<header transition:slide on:introend={() => transition1Done = true}>
    {#if transition1Done}
        <span transition:fly={{delay: 0, y: -100}}><Link to="/">PIKT.ink</Link></span>
    {/if}
    {#if transition1Done}
        <div class="right" transition:fly={{delay: 200, x: 200}}>
            Pierric Willemet | V0.0.6<br/>
            Images hébergées par <a href="https://unsplash.com" target="_blank">Unsplash</a>
        </div>
    {/if}
</header>

<style>
    header {
        grid-area: hdr;
        background: var(--color1);
        color: var(--color2);
        display: flex;
        align-items: flex-end;
        padding: .3em;
        overflow: hidden;
    }

    header span > :global(a) {
        color: var(--color2);
        font-size: 4em;
        font-weight: bold;
        padding-left: 1em;
    }

    header span > :global(a:hover) {
        text-decoration: none;
    }

    .right {
        margin-left: auto;
        margin-right: 1em;
    }
</style>
