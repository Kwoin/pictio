<script lang="ts">
  import type { Picture as ModelPicture } from "../model/game";
  import { createEventDispatcher } from "svelte";
  import { highlight } from "../services/store/game";
  import { addPictureLike, isPictureLiked } from "../services/storage/game";
  import { fly } from "svelte/transition";
  import { tooltip } from "../common/tooltip";

  export let picture: ModelPicture;
  export let useUrl: "small" | "medium" | "big" | "origin" = "medium";
  export let sstyle: string;

  const dispatch = createEventDispatcher();
  let like = isPictureLiked(picture.id);

  function handleClick(e) {
    dispatch('pictureClick', picture);
  }

  function handleLike(e) {
    addPictureLike(picture.id);
    like = true;
  }

  function handleUnlike(e) {
    addPictureLike(picture.id);
    like = false;
  }

  // Animation keyframe dans global.css
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

  function defineHeight(node: HTMLImageElement) {
    node.addEventListener("load", () => {
      console.log("height", node.height);
      ((node.parentNode.parentNode) as HTMLElement).style.height = `${node.height}px`;
    })
  }

</script>

<figure on:click={handleClick} style="{sstyle}">
    <div use:highlightAnimation class="picture" style="{sstyle}">
        <img src="{picture[`url_${useUrl}`]}" alt="{picture.description}" style="{sstyle}" use:defineHeight/>
    </div>
    <div class="overlay" style="{sstyle}">
        <div class="shadow"></div>
        <div class="meta" style="{sstyle}">
            <div class="actions" style="{sstyle}">
                {#if like}
                    <span class="icon" on:click|stopPropagation={handleUnlike} in:fly={{y: -20}} use:tooltip={{content: "Je n'aime plus", placement: "bottom", delay: [1000, 0]}}>❤️</span>
                {:else}
                    <span class="icon" on:click|stopPropagation={handleLike} in:fly={{y: -20}} use:tooltip={{content: "J'aime", placement: "bottom", delay: [1000, 0]}}>🤍</span>
                {/if}
                <span class="icon" use:tooltip={{content: "Télécharger", placement: "bottom", delay: [1000, 0]}}>
                    <a href="{picture.download_url}" download target="_blank">💾</a>
                </span>
            </div>
            <figcaption><a href="{picture.author_url}" target="_blank" on:click|stopPropagation>{picture.author}</a></figcaption>
        </div>
    </div>
</figure>

<style>
    figure {
        cursor: pointer;
        margin: auto;
        user-select: none;
        position: relative;
        height: 100%;
    }

    .picture {
        height: 100%;
    }

    img {
        max-width: 100%;
        display: block;
    }

    .overlay, .meta, .shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transition: opacity 350ms ease-out;
    }

    .meta {
        display: flex;
        flex-direction: column;
    }

    .shadow {
        background: #000;
        opacity: 0.2;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .actions span {
        font-size: 1.2em;
        transition: font-size 250ms;
    }

    figcaption {
        margin-top: auto;
        font-weight: bold;
        transition: font-size 250ms;
        margin-bottom: 0.5em;
    }

    figcaption a {
        color: var(--color2);
    }

    @media (hover: hover) {
        .overlay {
            opacity: 0;
        }

        figure:hover .overlay {
            opacity: 1;
        }

        .icon:hover {
            font-size: 1.6em;
        }

        figcaption:hover {
            font-size: 1.2em;
        }
    }

</style>
