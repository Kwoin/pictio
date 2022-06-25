<script lang="ts">

import { Link } from "svelte-routing";
import Main from "../layout/Main.svelte";

</script>

<Main>
    <div slot="main" class="home">
        <Link to="/new-game">Nouvelle partie</Link>
    </div>
</Main>

<style>
    .home {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        font-size: 2em;
    }
</style>

