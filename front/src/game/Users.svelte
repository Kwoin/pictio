<script lang="ts">

  import { game, myUserId, round, users, me } from "../services/store/game";
  import { GAME_STATE, MSG_TYPE_TO_BACK } from "../../../server/shared/constants.js"
  import { fly } from "svelte/transition";
  import { sendWsRequest } from "../services/websocket/websocket";

  function handleToggleReady(event) {
    sendWsRequest($me.ready ? MSG_TYPE_TO_BACK.USER_NOT_READY : MSG_TYPE_TO_BACK.USER_READY)
  }
</script>

{#if $users.length > 0}
    <ul transition:fly={{ x: -400 }} >
        {#each $users as user (user.id)}
            <li class:me={user.id === $myUserId}
                class:ready={$game.state === GAME_STATE.LOBBY && user.ready}
                class:not-ready={$game.state === GAME_STATE.LOBBY && !user.ready}
                class:solo={user.id === $round?.solo_user_id}
                class:success={$game.state === GAME_STATE.PROGRESS && user.success != null}
                class:searching={user.id !== $round?.solo_user_id && $game.state === GAME_STATE.PROGRESS && user.success == null}
                transition:fly={{ x: -100 }}
            >
                <div class="indicateur"></div>
                <div class="username">{user.username}
                    {#if $game.state === GAME_STATE.LOBBY }
                        <!-- Bouton Prêt / Pas Prêt : Supprimé en V0.0.6 -->
                        <!--{#if user.id === $myUserId}-->
                        <!--    <button class="ready-button" on:click={handleToggleReady}>{$me.ready ? 'Pas prêt' : 'Prêt'}</button>-->
                        <!--{/if}-->
                    {:else}
                        <div class="user-score">{user.game_score}</div>
                    {/if}
                </div>
            </li>
        {/each}
    </ul>
{/if}

<style>
    ul {
        display: flex;
        width: 100%;
        padding: 4px;
        overflow: auto;
        flex-direction: column;
        gap: 4px;
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

    @media screen and (max-width: 630px) {
        ul {
            flex-direction: row;
        }

        .username {
            max-width: 18vw;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .indicateur {
            margin-right: 0.4em;
        }
    }

    @media (hover: hover) {
        li:hover {
            background: none;
        }
    }

</style>
