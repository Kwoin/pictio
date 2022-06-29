<script lang="ts">

import { Link } from "svelte-routing";
import Main from "../layout/Main.svelte";

</script>

<Main>
    <div slot="main" class="home">
        <div><Link to="/new-game">Nouvelle partie</Link></div>
        <hr/>
        <section class="last-change-section">
            <h1 class="last-change-title">Derniers changements</h1>
            <hr/>
            <article>
                <h2><time datetime="2022-06-29">29 / 06 / 2022</time>&nbsp;|&nbsp;version 0.0.2</h2>
                <ul>
                    <li><span class="list-icon">🐞</span> Correction du bouton "Prêt" dans la salle d'attente.</li>
                    <li><span class="list-icon">💡</span> Retrait de l'icône "Copier le lien" lorsque le <pre class="inline">clipboard</pre> n'est pas accessible.</li>
                    <li><span class="list-icon">💡</span> Corrections orthographiques.</li>
                    <li><span class="list-icon">🚀</span> Optimisation de la requête de récupération d'images aléatoires. Il est désormais possible de récupérer 1500 images / heure.</li>
                </ul>
            </article>
            <hr/>
        </section>
    </div>
</Main>

<style>
    .home {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 2.5em;
    }

    .last-change-section {
        display: flex;
        flex-direction: column;
        font-size: 1rem;
    }

    .last-change-section hr {
        border-width: 10px;
        width: auto;
        margin-top: 1em;
    }

    .list-icon {
        display: inline-block;
        width: 2em;
        text-align: center;
    }
</style>

