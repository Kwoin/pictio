<script lang="ts">
  import { MSG_TYPE_TO_BACK, GAME_STATE } from "../../../server/ws/constants.js"
  import { game, users, me, messages, round } from "../store/game";
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import GameSession from "./GameSession.svelte";
  import Main from "../layout/Main.svelte";

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

  function handleToggleReady(event) {
    const type = $me.ready ? MSG_TYPE_TO_BACK.USER_NOT_READY : MSG_TYPE_TO_BACK.USER_READY;
    const msg = createWsMsg(type)
    $websocket.send(msg);
  }

  function handleStart(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.GAME_START, {game_id: $game.id})
    $websocket.send(msg);
  }

  function handleSubmitNewMessage(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.PLAY_SEND_MESSAGE, {text: newMessage});
    $websocket.send(msg);
    newMessage = null;
  }

  function handleReadyNextRound(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.USER_READY_NEXT_ROUND)
    $websocket.send(msg)
  }

</script>

<Main>
    <div slot="left">
        <ul>
            {#each $users as user}
                <li>
                    <span>{user.username}</span> - <span>{user.ready ? 'READY' : 'WAIT'}</span>
                </li>
            {/each}
        </ul>
    </div>
    <div slot="main">
        {#if $game != null && $me != null }
            {#if $game.state === GAME_STATE.LOBBY }

                <button on:click={handleToggleReady}>{$me.ready ? 'CANCEL READY' : 'READY'}</button>
                {#if $me.game_owner}
                    <button on:click={handleStart} disabled="{$users.length < 2 || $users.some(user => !user.ready)}">START</button>
                {/if}
                <a href="{window.location.href}" target="_blank">JOIN</a>
            {:else}
                <GameSession/>
            {/if}
        {:else}
            <form on:submit|preventDefault={handleSubmit}>
                <label for="username">Username</label>
                <input id="username" type="text" bind:value={username}/>
                <button type="submit">Submit</button>
            </form>
        {/if}
    </div>
    <div slot="right">
        <ul>
            {#each $messages as message}
                <li>
                    {message.type} - {$users.find(u => u.id === message.user_id)?.username} - {message.text}
                </li>
            {/each}
        </ul>
        {#if $round != null}
            {#if $round.end == null}
                {#if $me.id !== $game.solo_user_id}
                    <form on:submit|preventDefault={handleSubmitNewMessage}>
                        <label for="newMessage">Message</label>
                        <input id="newMessage" type="text" bind:value={newMessage}/>
                        <button type="submit">ENVOYER</button>
                    </form>
                {/if}
            {:else}
                <button on:click={handleReadyNextRound}>CONFIRM</button>
            {/if}
        {/if}
    </div>
</Main>

<style>

</style>
