<script lang="ts">
  import { MSG_TYPE_TO_BACK, GAME_STATE } from "../../../server/ws/constants.js"
  import { game, users, me, messages, round } from "../store/game";
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import GameSession from "./GameSession.svelte";
  import Main from "../layout/Main.svelte";
  import Users from "./Users.svelte";
  import { tooltip } from "../common/tooltip";
  import Toastify from 'toastify-js'
  import Messages from "./Messages.svelte";

  export let params;
  let username;
  let newMessage: string;

  function getGameId() {
    return parseInt(params.id, 36);
  }

  function handleSubmit(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.USER_JOIN, {
      game_id: getGameId(),
      username
    });
    $websocket.send(msg);
  }

  function handleStart(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.GAME_START, {game_id: $game.id})
    $websocket.send(msg);
  }

  function handleClipboard(event) {
    navigator.clipboard.writeText(window.location.href);
    Toastify({
      text: "Lien inséré dans le presse-papier !",
      position: "center"
    }).showToast();
  }

</script>

<Main>

    <Users slot="left"/>
    <div class="main" slot="main">
        {#if $game != null && $me != null }
            {#if $game.state === GAME_STATE.LOBBY }
                <div class="lobby">
                    <h1>Salle d'attente</h1>
                    Partager ce lien pour invitez vos amis
                    <div class="join-link">
                        <a href="{window.location.href}">{window.location.href}</a>
                        <span class="icon" on:click={handleClipboard} use:tooltip={{content: "Copier", placement: "right"}}>📝​</span>
                    </div>
                    {#if $me.game_owner}
                        <button on:click={handleStart} disabled="{$users.length < 2 || $users.some(user => !user.ready)}">Commencer</button>
                    {/if}
                </div>
            {:else}
                <GameSession/>
            {/if}
        {:else}
            <form on:submit|preventDefault={handleSubmit}>
                <label for="username">Nom d'utilisateur</label>
                <input id="username" type="text" bind:value={username}/>
                <button type="submit">Valider</button>
            </form>
        {/if}
    </div>
    <Messages slot="right"/>

</Main>

<style>
    .main {
        width: 100%;
        height: 100%;
    }

    .lobby {
        padding: 2em;
    }

    .join-link {
        font-size: 2em;
    }
</style>
