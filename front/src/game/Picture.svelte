<script lang="ts">
    import type { Picture as ModelPicture } from "../model/game";
    import { createEventDispatcher } from "svelte";

    export let picture: ModelPicture;

    const dispatch = createEventDispatcher();

    function handleClick(e) {
      dispatch('pictureClick', picture);
    }

</script>

<figure>
    <img on:click={handleClick} src="{picture.url}" alt="{picture.description}"/>
    <figcaption>{picture.author}</figcaption>
</figure>

<style>
    img {
        cursor: pointer;
        width: 10vw;
    }
</style>
