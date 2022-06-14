<script lang="ts">
  import { MSG_TYPE_TO_BACK } from "../../../server/ws/constants.js"
  import { websocket } from "../store/web-socket";

  export let username = "";

  const ws = $websocket;

  function handleSubmit(event) {
    ws.send(JSON.stringify(
        {
          type: MSG_TYPE_TO_BACK.GAME_CREATE,
          payload: {
            username
          }
        }
    ));
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <input type="text" bind:value={username}/>
    <button type="submit">Submit</button>
</form>
<span>{username}</span>
