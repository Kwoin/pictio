<script lang="ts">

  import { endRound, game, me, messages, round, startRound, users } from "../services/store/game";
  import { MSG_TYPE_TO_BACK, GAME_STATE, ROUND_DURATION } from "../../../server/shared/constants.js";
  import { timer } from "../services/store/timer";
  import { fly } from "svelte/transition";
  import { sendWsRequest } from "../services/websocket/websocket";

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
    sendWsRequest(MSG_TYPE_TO_BACK.PLAY_SEND_MESSAGE, {text: newMessageTrimmed})
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
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 10% 80% 10%;
        grid-template-areas:
          "tmr"
          "msg"
          "frm";
        background: var(--color1);
        color: var(--color2);
    }

    .message-form {
        grid-area: frm;
        position: relative;
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
        grid-area: tmr;
        border-bottom: 3px solid #aaa;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Cascadia Code", serif;
        font-size: 2.5em;
    }

    ul {
        grid-area: msg;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-bottom: 3px solid #aaa;
    }

    @media screen and (max-width: 630px) {
        .messages {
            grid-template-columns: 25vw 1fr;
            grid-template-rows: 50% 50%;
            grid-template-areas:
                "tmr msg"
                "frm msg";
        }
        .timer, ul {
            border-bottom: none;
            padding: 0 0.4em;
            max-height: 100%;
        }

        .timer {
            font-size: 1.5em;
        }

        ul {
            border-left: 3px solid #aaa;
        }

        .message-form {
            border-top: 3px solid #aaa;
            padding: 0 0.4em;
        }

        .message-form button {
            display: none;
        }

        #newMessage {
            width: 100%;
            padding-right: 0;
        }
    }

</style>
