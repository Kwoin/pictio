<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Home from "./home/Home.svelte";
  import NewGame from "./game/NewGame.svelte";
  import Game from "./game/Game.svelte";
  import Header from "./layout/Header.svelte";
  import "toastify-js/src/toastify.css"

  export let url = "";

</script>

<div class="grid">
    <Router url="{url}">
        <Header/>

        <Route path="new-game">
            <NewGame/>
        </Route>
        <Route path="game/:id" let:params>
            <Game params="{params}"/>
        </Route>
        <Route path="/">
            <Home/>
        </Route>

    </Router>
</div>
<style>
    .grid {
        display: grid;
        height: 100%;
        grid-template-columns: repeat(12, 1fr);
        grid-template-rows: var(--header-height) var(--content-height);
        grid-template-areas:
          "hdr hdr hdr hdr hdr hdr hdr hdr hdr hdr hdr hdr"
          "ctn ctn ctn ctn ctn ctn ctn ctn ctn ctn ctn ctn"
    }

</style>
