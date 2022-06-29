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
  let username = "";
  $: usernameTrimmed = username.trim();

  function getGameId() {
    return parseInt(params.id, 36);
  }

  function handleSubmit(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.USER_JOIN, {
      game_id : getGameId(),
      username: usernameTrimmed
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
      text    : "Lien inséré dans le presse-papier !",
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
                    <div class="join-link">
                        <p>Partagez ce lien pour inviter vos amis</p>
                        <a href="{window.location.href}">{window.location.href}</a>
                        {#if navigator.clipboard != null}
                            <span class="icon" on:click={handleClipboard} use:tooltip={{content: "Copier", placement: "right"}}>📝​</span>
                        {/if}
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
                <input id="username"
                       maxlength="25"
                       pattern="[^ \t\r\n]*"
                       title="espace non autorisé"
                       type="text"
                       autofocus
                       bind:value={username}/>
                <button type="submit" disabled="{!usernameTrimmed}">Valider</button>
            </form>
        {/if}
    </div>
    <Messages slot="right"/>

</Main>

<style>
    .main {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
    }

    .lobby {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .lobby .join-link {
        margin-top: auto;
        margin-bottom: auto;
    }

    .lobby button {
        margin-bottom: auto;
    }

    .join-link {
        font-size: 2em;
        text-align: center;
    }
</style>
