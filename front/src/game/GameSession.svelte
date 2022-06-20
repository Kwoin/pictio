<script lang="ts">
  import { MSG_TYPE_TO_BACK, GAME_STATE } from "../../../server/ws/constants.js"
  import { users, me, pictures, messages, game, randomPictures, word, roundTimer, round } from "../store/game";
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import type { User, Picture as PictureModel } from "../model/game";
  import Picture from "./Picture.svelte";

  const dateTimeFormat = new Intl.DateTimeFormat("default", { minute: "2-digit", second: "2-digit"});

  function getVainqueur(): User {
    return $users.reduce((vainqueur, user) => vainqueur.game_score > user.game_score ? vainqueur : user, $users[0]);
  }

  function handlePictureClick(event) {
    const index = $pictures.length;
    const msg = createWsMsg(MSG_TYPE_TO_BACK.PLAY_SEND_CARD, {...event.detail, index});
    $websocket.send(msg);
  }

</script>

<h2>USERS</h2>
<ul>
    {#each $users as user}
        <li>{user.username}{user.id === $round.solo_user_id ? ' - SOLO' : ''}{user.success != null ? ' - SUCCESS' : ''} -
            Score: { user.game_score }</li>
    {/each}
</ul>
{#if $game.state === GAME_STATE.DONE}
    <em>Vainqueur: {getVainqueur().username}</em>
{:else if $game.state === GAME_STATE.ABORTED}
    <em>La partie est terminée car son propriétaire s'est déconnecté.</em>
{:else}
    <hr/>
    <h2>PICTURES</h2>
    <ul class="flex">
        {#each $pictures as picture}
            <li>
                <Picture picture="{picture}" />
            </li>
        {/each}
    </ul>
    {#if $me.id === $round.solo_user_id && $round.end == null}
        <h3>MOT SECRET : {$word}</h3>
        <h3>SELECT PICTURE</h3>
        <ul class="flex">
            {#each $randomPictures as picture}
                <li>
                    <Picture picture="{picture}" on:pictureClick={handlePictureClick} />
                </li>
            {/each}
        </ul>
    {/if}
{/if}

<style>

</style>
