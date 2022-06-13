<script lang="ts">
  import { websocket } from "../store/web-socket";

  export let username = "";

  const ws = $websocket;

  function handleSubmit(event) {
    ws.send(JSON.stringify(
        {
          type: "new-game",
          username
        }
    ));
    console.log("kwoin")
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <input type="text" bind:value={username}/>
    <button type="submit">Submit</button>
</form>
<span>{username}</span>
