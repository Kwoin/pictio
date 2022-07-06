<script lang="ts">

  import { endRound, game, me, messages, round, startRound, users } from "../store/game";
  import { createWsMsg } from "../utils";
  import { websocket } from "../store/web-socket";
  import { MSG_TYPE_TO_BACK, GAME_STATE, ROUND_DURATION } from "../../../server/shared/constants.js";
  import { timer } from "../store/timer";
  import { fly } from "svelte/transition";

  let newMessage = "";
  $: newMessageTrimmed = newMessage.trim();
  const dateTimeFormat = new Intl.DateTimeFormat("default", {minute: "2-digit", second: "2-digit"});
  const roundTimer = timer(ROUND_DURATION);
  const roundTime = roundTimer.time;
  startRound.subscribe(start => {
    if (start != null) roundTimer.start();
  })
  endRound.subscribe(end => {
    if (end != null) roundTimer.stop();
  })

  function handleSubmitNewMessage(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.PLAY_SEND_MESSAGE, {text: newMessageTrimmed});
    $websocket.send(msg);
    newMessage = "";
  }

  function autoScrollDown(node: HTMLElement) {
    messages.subscribe(_ => setTimeout(() => node.scrollTop += 100, 200))
  }

</script>

{#if $game?.state === GAME_STATE.PROGRESS}
    <div class="messages" transition:fly={{x: 400}}>
        <div class="timer">
            {dateTimeFormat.format(new Date($roundTime))}
        </div>
        <ul use:autoScrollDown>
            {#each $messages as message}
                <li style="color: {$users.find(u => u.id === message.user_id)?.color}">
                    {#if message.user_id != null}
                        <b>{$users.find(u => u.id === message.user_id)?.username}&nbsp;:&nbsp;</b>
                    {/if}
                    {message.text}
                </li>
            {/each}
        </ul>
        {#if $round != null && $me != null}
            {#if $round.end == null}
                {#if $me.id !== $round.solo_user_id}
                    <form class="message-form" autocomplete="off" on:submit|preventDefault={handleSubmitNewMessage}>
                        <input id="newMessage" maxlength="148" autofocus type="text" bind:value={newMessage}/>
                        <button type="submit" disabled="{!newMessageTrimmed}">✒️</button>
                    </form>
                {/if}
            {/if}
        {/if}
    </div>
{/if}

<style>
    .messages {
        min-width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--color1);
        color: var(--color2);
    }

    .message-form {
        position: relative;
        min-height: 10%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .message-form button {
        position: absolute;
        right: 16px;
        border: none;
        background: none;
    }

    #newMessage {
        width: 90%;
        padding-right: 30px;
    }

    .timer {
        min-height: 5%;
        border-bottom: 3px solid #aaa;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Cascadia Code", serif;
        font-size: 2.5em;
    }

    ul {
        min-height: 85%;
        max-height: 85%;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-bottom: 3px solid #aaa;
    }

</style>
