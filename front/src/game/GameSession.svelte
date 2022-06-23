<script lang="ts">
  import { MSG_TYPE_TO_BACK, GAME_STATE, CONFIRM_DURATION } from "../../../server/ws/constants.js"
  import { users, pictures, game, randomPictures, word, round, myUserId, endRound, scores, startRound } from "../store/game";
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import type { User } from "../model/game";
  import Picture from "./Picture.svelte";
  import Gallery from "./Gallery.svelte";
  import { timer } from "../store/timer";

  const confirmDateTimeFormat = new Intl.DateTimeFormat("default", {second: "numeric"});
  const confirmTimer = timer(CONFIRM_DURATION);
  const confirmTime = confirmTimer.time;

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

  function handlePictureClick(event) {
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

</script>

<div class="game-session">
    {#if $game.state === GAME_STATE.DONE}
        <em>Vainqueur: {getVainqueur().username}</em>
    {:else if $game.state === GAME_STATE.ABORTED}
        <em>La partie est terminée car son propriétaire s'est déconnecté.</em>
    {:else if showScores}
        <div class="scores">
            <h2>Scores</h2>
            <ul>
                {#each $scores as score}
                    <li><b>{score.user.username}</b> : {score.score}</li>
                {/each}
            </ul>
            <button on:click={handleConfirmNextRound}>Continuer ({confirmDateTimeFormat.format(new Date($confirmTime))})</button>
        </div>
    {:else}
        {#if $myUserId === $round.solo_user_id && $round.end == null}
            <div class="solo">
                {#if $word != null}
                    <span class="cle">{$word.toLocaleUpperCase()}</span>
                {/if}
                <ul class="randomPictures">
                    {#each $randomPictures as picture}
                        <li>
                            <Picture picture="{picture}"
                                     width="200px"
                                     on:pictureClick={handlePictureClick}/>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
        <Gallery pictures="{$pictures}"/>
    {/if}
</div>

<style>
    .game-session {
        display: flex;
        height: 100%;
        width: 100%;
    }

    .solo {
        max-width: 240px;
        min-height: 100%;
        display: flex;
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
        overflow: auto;
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
</style>
