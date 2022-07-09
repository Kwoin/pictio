<script>

  import { Link } from "svelte-routing";
  import { slide, fly } from "svelte/transition";
  import { pathname } from "../services/store/layout";
  import * as pkg from "../../package.json";

  let transition1Done = false;

</script>

<header transition:slide on:introend={() => transition1Done = true} class:minifyable={$pathname?.startsWith("/game")}>
    {#if transition1Done}
        <span transition:fly={{delay: 0, y: -100}}><Link to="/">PIKT.ink</Link></span>
    {/if}
    {#if transition1Done}
        <div class="right" transition:fly={{delay: 200, x: 200}}>
            <div id="wcb" class="carbonbadge" in:fly={{x: -100}} out:fly={{x: 100}}></div>
            <script src="https://unpkg.com/website-carbon-badges@1.1.3/b.min.js" defer></script>
            <style>
                #wcb_2 {
                    display: none !important;
                }
            </style>
            Pierric Willemet | V{pkg.version}<br/>
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
        gap: 1rem;
        position: relative;
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

    @media screen and (max-width: 630px) {
        header span > :global(a) {
            font-size: 2em;
        }

        .right {
            font-size: 0.75em;
        }

        .minifyable {
            display: none;
        }

        #wcb {
            display: none;
        }
    }


</style>
