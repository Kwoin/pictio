<script lang="ts">
  import { MSG_TYPE_TO_BACK, GAME_STATE } from "../../../server/shared/constants.js"
  import { game, users, me } from "../services/store/game";
  import GameSession from "./GameSession.svelte";
  import Main from "../layout/Main.svelte";
  import Users from "./Users.svelte";
  import { tooltip } from "../common/tooltip";
  import Toastify from 'toastify-js'
  import Messages from "./Messages.svelte";
  import { updatePathname } from "../services/store/layout";
  import { getStorageGame } from "../services/storage/game";
  import { canRecover, doRecover } from "../services/recovery/recovery";
  import { sendWsRequest } from "../services/websocket/websocket";
  import Loader from "../layout/Loader.svelte";
  import { navigate } from "svelte-routing";
  import { onDestroy } from "svelte";

  export let params;
  let username = "";
  $: usernameTrimmed = username.trim();
  let recovering = false;

  updatePathname();

  onDestroy(() => {
    sendWsRequest(MSG_TYPE_TO_BACK.USER_LEAVE);
  })

  const gameData = getStorageGame();
  if (gameData?.game.id === getGameId()) {
    // Cas où l'utilisateur a potentiellement besoin d'un recover
    recovering = true;
    canRecover()
        .then(gameId => {
          if (gameId) {
            // Cas où le recover est possible
            return doRecover()
          } else {
            navigate("/");
          }
        })
  }

  function getGameId() {
    return parseInt(params.id, 36);
  }

  function handleSubmit(event) {
    sendWsRequest(MSG_TYPE_TO_BACK.USER_JOIN, {
      game_id : getGameId(),
      username: usernameTrimmed
    })
  }

  function handleStart(event) {
    sendWsRequest(MSG_TYPE_TO_BACK.GAME_START, {game_id: $game.id})
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
    <div slot="main" class="game">
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
                                <span class="icon" on:click={handleClipboard}
                                      use:tooltip={{content: "Copier", placement: "right"}}>📝​</span>
                                {/if}
                            </div>
                            {#if $me.game_owner}
                                <button on:click={handleStart} disabled="{$users.length < 2 || $users.some(user => !user.ready)}">Commencer
                                </button>
                            {/if}
                        </div>
                    {:else}
                        <GameSession/>
                    {/if}
                {:else if recovering}
                    <Loader/>
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
    </div>
</Main>

<style>

    .game {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-template-rows: var(--content-height);
        grid-template-areas:
          "lft lft ctn ctn ctn ctn ctn ctn ctn ctn rgt rgt"
    }

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

    .join-link {
        margin-top: auto;
        margin-bottom: auto;
        font-size: 2em;
        text-align: center;
        padding: 1em;
    }

    .lobby button {
        margin-bottom: auto;
    }

    @media screen and (max-width: 630px) {
        .game {
            grid-template-rows: var(--smalld-lft-height) var(--smalld-content-height) var(--smalld-rgt-height);
            grid-template-areas:
                "lft lft lft lft lft lft lft lft lft lft lft lft"
                "ctn ctn ctn ctn ctn ctn ctn ctn ctn ctn ctn ctn"
                "rgt rgt rgt rgt rgt rgt rgt rgt rgt rgt rgt rgt"
        }

        .join-link {
            font-size: 1em;
        }
    }
</style>
