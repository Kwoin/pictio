<script lang="ts">
  import { MSG_TYPE_TO_BACK } from "../../../server/ws/constants.js"
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import Main from "../layout/Main.svelte";
  import { resetStores } from "../store/game";

  export let username = "";

  resetStores();

  function handleSubmit(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.GAME_CREATE, {username});
    $websocket.send(msg);
  }
</script>

<Main>
        <form slot="main" on:submit|preventDefault={handleSubmit}>
            <label for="username">Nom d'utilisateur</label>
            <input id="username" type="text" bind:value={username}/>
            <button type="submit">Créer une partie</button>
        </form>
</Main>

<style>
    form {
        padding: 4px;
    }
</style>
