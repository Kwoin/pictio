<script lang="ts">
    import type { Picture as ModelPicture } from "../model/game";
    import { createEventDispatcher } from "svelte";

    export let picture: ModelPicture;
    export let height: string;
    export let width: string;

    const dispatch = createEventDispatcher();

    function handleClick(e) {
      dispatch('pictureClick', picture);
    }

</script>

<figure on:click={handleClick}>
    <img src="{picture.url}" alt="{picture.description}" style="width: {width}; height: {height}"/>
    <figcaption>{picture.author}</figcaption>
</figure>

<style>
    figure {
        cursor: pointer;
    }
    figcaption {
        font-size: .8em;
    }
</style>
