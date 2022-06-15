<script>
  import { MSG_TYPE_TO_BACK } from "../../../server/ws/constants.js"
  import { game, users, me } from "../store/game";
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";

  export let params;
  let username;

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
    const type = $me.lobby_ready ? MSG_TYPE_TO_BACK.USER_NOT_READY : MSG_TYPE_TO_BACK.USER_READY;
    const msg = createWsMsg(type, {user_id: $me.id})
    $websocket.send(msg);
  }

  function handleStart(event) {
    // todo
    console.log("start");
  }

</script>

{#if $game != null && $me != null }
    <ul>
        {#each $users as user}
            <li>
                <span>{user.username}</span> - <span>{user.lobby_ready ? 'READY' : 'WAIT'}</span>
            </li>
        {/each}
    </ul>
    <button on:click={handleToggleReady}>{$me.lobby_ready ? 'CANCEL READY' : 'READY'}</button>
    {#if $me.game_owner}
        <button on:click={handleStart} disabled="{$users.length >= 2}">START</button>
    {/if}
{:else}
    <form on:submit|preventDefault={handleSubmit}>
        <label for="username">Username</label>
        <input id="username" type="text" bind:value={username}/>
        <button type="submit">Submit</button>
    </form>
{/if}

<style>

</style>
