<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./home/Home.svelte";
  import NewGame from "./new-game/NewGame.svelte";

  export let url = "";

</script>

<Router url="{url}">
    <nav>
        <Link to="/">Home</Link>
        <Link to="new-game">New Game</Link>
    </nav>
    <div>
        <Route path="new-game" component="{NewGame}" />
        <Route path="/"><Home /></Route>
    </div>
</Router>

<style>

</style>
