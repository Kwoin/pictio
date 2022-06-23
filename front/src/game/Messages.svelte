<script lang="ts">

  import { endRound, game, me, messages, round, startRound, users } from "../store/game";
  import { createWsMsg } from "../utils";
  import { websocket } from "../store/web-socket";
  import { MSG_TYPE_TO_BACK, GAME_STATE, ROUND_DURATION } from "../../../server/ws/constants.js";
  import { timer } from "../store/timer";

  let newMessage: string;
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
    const msg = createWsMsg(MSG_TYPE_TO_BACK.PLAY_SEND_MESSAGE, {text: newMessage});
    $websocket.send(msg);
    newMessage = null;
  }

</script>

{#if $game?.state === GAME_STATE.PROGRESS}
    <div class="messages">
        <div class="timer">
            {dateTimeFormat.format(new Date($roundTime))}
        </div>
        <ul>
            {#each $messages as message}
                <li>
                    {#if message.user_id != null}
                        <span><b>{$users.find(u => u.id === message.user_id)?.username} : </b></span>
                    {/if}
                    {message.text}
                </li>
            {/each}
        </ul>
        {#if $round != null && $me != null}
            {#if $round.end == null}
                {#if $me.id !== $round.solo_user_id}
                    <form on:submit|preventDefault={handleSubmitNewMessage}>
                        <label for="newMessage">Message</label>
                        <input id="newMessage" type="text" bind:value={newMessage}/>
                        <button type="submit">ENVOYER</button>
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

    .timer {
        min-height: 5%;
        border-bottom: 2px solid #aaa;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Cascadia Code", serif;
        font-size: 2.5em;
    }

    ul {
        min-height: 85%;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    form {
        min-height: 10%;
    }
</style>
