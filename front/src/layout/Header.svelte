<script>

import { Link } from "svelte-routing";

</script>

<header>
    <Link to="/">PICT.IO</Link>
    <div class="right">
        Pierric Willemet | V0.0.1<br/>
        Images hébergées par <a href="https://unsplash.com" target="_blank">Unsplash</a>
    </div>

</header>

<style>
    header {
        grid-area: hdr;
        background: var(--color2);
        display: flex;
        align-items: flex-end;
        padding: .3em;
    }

    header > :global(a) {
        color: var(--color1);
        font-size: 4em;
        font-weight: bold;
        padding-left: 3em;
    }

    header > :global(a:hover) {
        text-decoration: none;
    }

    .right {
        margin-left: auto;
        margin-right: 1em;
    }
</style>
