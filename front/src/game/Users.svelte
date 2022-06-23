<script lang="ts">

  import { game, myUserId, round, users, me } from "../store/game";
  import { GAME_STATE, MSG_TYPE_TO_BACK } from "../../../server/ws/constants.js"
  import { createWsMsg } from "../utils";
  import { websocket } from "../store/web-socket";

  function handleToggleReady(event) {
    const type = $me.ready ? MSG_TYPE_TO_BACK.USER_NOT_READY : MSG_TYPE_TO_BACK.USER_READY;
    const msg = createWsMsg(type)
    $websocket.send(msg);
  }
</script>

{#if $users.length > 0}
    <ul>
        {#each $users as user}
            <li class:me={user.id === $myUserId}
                class:ready={$game.state === GAME_STATE.LOBBY && user.ready}
                class:not-ready={$game.state === GAME_STATE.LOBBY && !user.ready}
                class:solo={user.id === $round?.solo_user_id}
                class:success={$game.state === GAME_STATE.PROGRESS && user.success != null}
                class:searching={user.id !== $round?.solo_user_id && $game.state === GAME_STATE.PROGRESS && user.success == null}
            >
                <div class="indicateur"></div>
                {user.username}
                {#if $game.state === GAME_STATE.LOBBY }
                    {#if user.id === $myUserId}
                        <button class="ready-button" on:click={handleToggleReady}>{$me.ready ? 'Pas prêt' : 'Prêt'}</button>
                    {/if}
                {:else}
                    - {user.game_score}
                {/if}
            </li>
        {/each}
    </ul>
{/if}

<style>
    ul {
        display: flex;
        width: 100%;
        overflow: auto;
        flex-direction: column;
        background: var(--color1);
        color: var(--color2);
    }

    li {
        display: flex;
        align-items: center;
        min-height: 5em;
        border: 1px solid #444;
        border-radius: 10px;
        overflow: hidden;
        background: rgba(255 255 255 / 25%);
        padding-right: 1em;
        transition: background-color 250ms;
    }

    li:hover {
        background: none;
    }

    .ready-button {
        margin-left: auto;
    }

    .indicateur {
        height: 100%;
        border-left-width: 12px;
        border-left-style: solid;
        margin-right: 1.5em;
    }

    .me {
        background: cadetblue;
    }

    .ready .indicateur, .success .indicateur {
        border-left-color: greenyellow;
    }

    .not-ready .indicateur {
        border-left-color: orange;
    }

    .solo .indicateur {
        border-left-color: gold;
    }

    .searching .indicateur {
        border-left-color: #555;
    }

</style>
