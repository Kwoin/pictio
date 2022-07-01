<script lang="ts">
    import type { Picture as ModelPicture } from "../model/game";
    import { createEventDispatcher } from "svelte";
    import { highlight } from "../store/game";

    export let picture: ModelPicture;
    export let useUrl: "small" | "medium" | "big" | "origin" = "small";
    export let sstyle: string;
    export let dynamic = true;

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

<figure on:click={handleClick} class:dynamic={dynamic}>
    <div use:highlightAnimation>
      <img src="{picture[`url_${useUrl}`]}" alt="{picture.description}" style="{sstyle}"/>
    </div>
    <figcaption>{picture.author}</figcaption>
</figure>

<style>
    figure {
        cursor: pointer;
        user-select: none;
        height: 100%;
    }

    figure div {
        display: inline-block;
        transition: transform 350ms ease-out;
        height: calc(100% - 20px);
    }

    figure.dynamic:hover div {
        transform: rotate(-3deg);
    }

    figure figcaption {
        font-size: .8em;
        font-weight: bold;
    }

    figure.dynamic figcaption {
        opacity: 0;
        transition: opacity 350ms ease-out;
    }

    figure.dynamic:hover figcaption {
        opacity: 1;
    }

</style>
