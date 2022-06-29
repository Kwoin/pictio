<script lang="ts">
    import type { Picture as ModelPicture } from "../model/game";
    import { createEventDispatcher } from "svelte";
    import { highlight } from "../store/game";

    export let picture: ModelPicture;
    export let height: string;
    export let width: string;

    const dispatch = createEventDispatcher();

    function handleClick(e) {
      dispatch('pictureClick', picture);
    }

    function highlightAnimation(node: HTMLDivElement) {
      node.addEventListener("animationend", ev => {
        node.classList.remove("highlight");
      })
      highlight.subscribe(picture_id => {
        if (picture_id === picture.id) {
          node.classList.remove("highlight");
          node.offsetWidth;
          node.classList.add("highlight");
        }
      })
    }

</script>

<figure on:click={handleClick}>
    <div use:highlightAnimation>
      <img src="{picture.url}" alt="{picture.description}" style="width: {width}; height: {height}"/>
    </div>
    <figcaption>{picture.author}</figcaption>
</figure>

<style>
    figure {
        cursor: pointer;
        user-select: none;
    }

    figure div {
        display: inline-block;
        transition: transform 350ms ease-out;
    }

    figure:hover div {
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
