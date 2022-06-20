<script>

</script>

<aside class="left">
<slot name="left"></slot>
</aside>
<main>
    <slot name="main"></slot>
</main>
<aside class="right">
    <slot name="right"></slot>
</aside>

<style>
    .left {
        grid-area: lft;
    }

    .right {
        grid-area: rgt;
    }

    main {
        grid-area: ctn;
    }
</style>
