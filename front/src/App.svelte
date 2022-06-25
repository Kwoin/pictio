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
        grid-template-columns: repeat(12, 1fr);
        grid-template-rows: 10vh 85vh 5vh;
        grid-template-areas:
          "hdr hdr hdr hdr hdr hdr hdr hdr hdr hdr hdr hdr"
          "lft lft ctn ctn ctn ctn ctn ctn ctn ctn rgt rgt"
          "lft lft ctn ctn ctn ctn ctn ctn ctn ctn rgt rgt"
    }
</style>
