<script lang="ts">
  import type { Picture as PictureModel } from "../model/game";
  import Picture from "./Picture.svelte";

  export let pictures: PictureModel[];
</script>

<ul>
    {#each pictures as picture}
        <li>
            <Picture picture="{picture}"/>
        </li>
    {/each}
</ul>

<style>
    ul {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 2px;
        height: 50vh;
    }
</style>
