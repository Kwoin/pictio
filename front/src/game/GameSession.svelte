<script lang="ts">
  import { MSG_TYPE_TO_BACK, GAME_STATE, CONFIRM_DURATION } from "../../../server/ws/constants.js"
  import { users, pictures, game, randomPictures, word, round, myUserId, endRound, scores, startRound, me } from "../store/game";
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import type { User } from "../model/game";
  import Picture from "./Picture.svelte";
  import Gallery from "./Gallery.svelte";
  import { timer } from "../store/timer";
  import { Picture as PictureModel } from "../model/game";
  import { fly, fade } from "svelte/transition";

  const confirmDateTimeFormat = new Intl.DateTimeFormat("default", {second: "numeric"});
  const confirmTimer = timer(CONFIRM_DURATION);
  const confirmTime = confirmTimer.time;

  let bigPicture: PictureModel;
  let showScores = false;
  endRound.subscribe(end => {
    if (end != null) {
      confirmTimer.start();
      showScores = true;
    }
  });
  startRound.subscribe(start => {
    if (start != null) showScores = false;
  })
  confirmTime.subscribe(time => {
    if (time === 0) handleConfirmNextRound();
  })

  function getVainqueur(): User {
    return $users.reduce((vainqueur, user) => vainqueur.game_score > user.game_score ? vainqueur : user, $users[0]);
  }

  function selectRandomPicture(event) {
    const index = $pictures.length;
    const msg = createWsMsg(MSG_TYPE_TO_BACK.PLAY_SEND_CARD, {...event.detail, index});
    $websocket.send(msg);
    randomPictures.set([]);
  }

  function handleConfirmNextRound() {
    confirmTimer.stop();
    const msg = createWsMsg(MSG_TYPE_TO_BACK.USER_READY_NEXT_ROUND)
    $websocket.send(msg)
  }

  function handleGalleryPictureClick(event) {
    if ($me.id === $round.solo_user_id) {
      const picture: PictureModel = event.detail;
      const msg = createWsMsg(MSG_TYPE_TO_BACK.PLAY_HIGHLIGHT_PICTURE, picture.id);
      $websocket.send(msg);
    } else {
      bigPicture = event.detail;
    }
  }

</script>

<div class="game-session">
    {#if $game.state === GAME_STATE.DONE}
        <div class="vainqueur">
            Vainqueur&nbsp;:&nbsp;<b>{getVainqueur().username}</b>
        </div>
    {:else if $game.state === GAME_STATE.ABORTED}
        <em>La partie est terminée car son propriétaire s'est déconnecté.</em>
    {:else if showScores}
        <div class="scores" transition:fly={{ x: 100, delay: 400 }}>
            <h2>Scores</h2>
            <p>Le mot secret était : <u>{$word}</u></p>
            <ul>
                {#each $scores as score}
                    <li><b>{score.user.username}</b>&nbsp;:&nbsp;{score.score}</li>
                {/each}
            </ul>
            <button on:click={handleConfirmNextRound}>Continuer ({confirmDateTimeFormat.format(new Date($confirmTime))})</button>
        </div>
    {:else}
        {#if $myUserId === $round.solo_user_id && $round.end == null}
            <div class="solo" transition:fly={{ x: -100 }}>
                {#if $word != null}
                    <span class="cle">{$word.toLocaleUpperCase()}</span>
                {/if}
                <ul class="randomPictures">
                    {#each $randomPictures as picture}
                        <li transition:fade>
                            <Picture picture="{picture}"
                                     sstyle={"width:200px"}
                                     on:pictureClick={selectRandomPicture}/>
                        </li>
                    {/each}
                </ul>
            </div>
            {#if $pictures.length === 0}
                <div class="help">
                    Sélectionnez des images pour faire deviner le mot secret !
                </div>
            {:else}
                <Gallery pictures="{$pictures}" on:pictureClick={handleGalleryPictureClick}/>
            {/if}
        {:else}
            {#if $pictures.length === 0}
                <div class="help">
                    Les images qui apparaîtront vont vous permettre de trouver le mot secret !
                </div>
            {:else if bigPicture != null}
                <div class="big-picture">
                    <Picture picture="{bigPicture}"
                             sstyle="max-width: 100%; max-height: 100%;"
                             useUrl="big"
                             dynamic="{false}"
                             on:pictureClick={() => bigPicture = null}
                    ></Picture>
                </div>
            {:else}
                <Gallery pictures="{$pictures}" on:pictureClick={handleGalleryPictureClick}/>
            {/if}
        {/if}
    {/if}
</div>

<style>
    .game-session {
        display: flex;
        height: 100%;
        width: 100%;
    }

    .solo {
        min-height: 100%;
        display: flex;
        min-width: 240px;
        align-items: center;
        flex-direction: column;
        background: var(--color1);
        color: var(--color2);
        --cle-height: 3em;
    }

    .cle {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        min-height: var(--cle-height);
    }

    .randomPictures {
        display: flex;
        max-height: calc(100% - var(--cle-height));
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%;
        align-items: center;
    }

    .scores {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .scores ul {
        margin-top: auto;
        margin-bottom: auto;
        font-size: 1.5em;
    }

    .scores button {
        margin-bottom: 2em;
    }

    .vainqueur {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 3em;
    }

    .help {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        font-size: 2em;
    }

    .big-picture {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
