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

    figure img {
        transition: transform 350ms ease-out;
    }

    figure:hover img {
        transform: rotate(-3deg);
    }

    figure figcaption {
        font-size: .8em;
        opacity: 0;
        transition: opacity 350ms ease-out;
        font-weight: bold;
    }

    figure:hover figcaption {
        opacity: 1;
    }


</style>
