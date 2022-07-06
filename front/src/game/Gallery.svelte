<script lang="ts">
  import type { Picture as PictureModel } from "../model/game";
  import Picture from "./Picture.svelte";
  import { fade } from "svelte/transition";

  export let pictures: PictureModel[];

</script>

<ul>
    {#each pictures as picture}
        <li transition:fade>
            <Picture picture="{picture}" on:pictureClick sstyle="width: clamp(100px, 12vw, 12vw)"/>
        </li>
    {/each}
</ul>

<style>
    ul {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 4px;
        min-height: 100%;
        align-content: baseline;
        flex: 100%;
        overflow-x: auto;
        padding: 0 4px;
    }
</style>
