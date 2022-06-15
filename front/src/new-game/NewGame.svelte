<script lang="ts">
  import { MSG_TYPE_TO_BACK } from "../../../server/ws/constants.js"
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";

  export let username = "";

  function handleSubmit(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.GAME_CREATE, { username });
    $websocket.send(msg);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <input type="text" bind:value={username}/>
    <button type="submit">Submit</button>
</form>
