<script>

import { Link } from "svelte-routing";

</script>

<header>
    <Link to="/">PICT.IO</Link>
</header>

<style>
    header {
        grid-area: hdr;
        font-size: 4em;
        font-weight: bold;
        background: var(--color2);
        padding-left: 3em;
    }

    header > :global(a) {
        color: var(--color1);
    }

    header > :global(a:hover) {
        text-decoration: none;
    }
</style>
