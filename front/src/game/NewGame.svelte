<script lang="ts">
  import { MSG_TYPE_TO_BACK } from "../../../server/ws/constants.js"
  import { websocket } from "../store/web-socket";
  import { createWsMsg } from "../utils";
  import Main from "../layout/Main.svelte";
  import { resetStores } from "../store/game";

  export let username = "";
  $: trimmed = username.trim();

  resetStores();

  function handleSubmit(event) {
    const msg = createWsMsg(MSG_TYPE_TO_BACK.GAME_CREATE, { username: trimmed});
    $websocket.send(msg);
  }
</script>

<Main>
    <div class="new-game" slot="main">
        <form on:submit|preventDefault={handleSubmit}>
            <label for="username">Nom d'utilisateur</label>
            <input id="username"
                   pattern="[^ \t\r\n]*"
                   title="espace non autorisé"
                   maxlength="25"
                   type="text"
                   autofocus
                   bind:value={username}/>
            <button type="submit" disabled="{!trimmed}">Créer une partie</button>
        </form>
    </div>
</Main>

<style>
    .new-game {
        width: 100%;
        display: flex;
        justify-content: center;
    }
</style>
