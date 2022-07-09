<script lang="ts">

  import { Link } from "svelte-routing";
  import Main from "../layout/Main.svelte";
  import { fly } from "svelte/transition";
  import { updatePathname } from "../services/store/layout";
  import { canRecover } from "../services/recovery/recovery";

  updatePathname();
  let recoverableGameId;

  canRecover().then(gameId => recoverableGameId = gameId);

</script>

<Main>
    <div slot="main" class="home">
        <div class="upper">
            <Link to="/new-game">Nouvelle partie</Link>
            {#if recoverableGameId }
                <Link to="/game/{recoverableGameId.toString(36)}">Reprendre la partie</Link>
            {/if}
        </div>
        <hr/>
        <section class="last-change-section">
            <h1 class="last-change-title">Derniers changements</h1>
            <div class="articles">
                <article>
                    <h2>
                        <time datetime="2022-07-09">09 / 07 / 2022</time>&nbsp;|&nbsp;version 0.0.9
                    </h2>
                    <ul>
                        <li><span class="list-icon">💡</span>Nouvelle favicon.</li>
                        <li><span class="list-icon">🐞</span> Correction d'un bug d'affichage qui faisait apparaître des ascenseurs inutiles.</li>
                        <li><span class="list-icon">🐞</span> Correction d'un bug d'affichage qui faisait empêcher de consulter correctement les images sélectionnées.</li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-07-08">08 / 07 / 2022</time>&nbsp;|&nbsp;version 0.0.8
                    </h2>
                    <ul>
                        <li><span class="list-icon">✨</span>Nouvelles actions "like" et "télécharger" sur les images.</li>
                        <li><span class="list-icon">✨</span>Nouvelle action "Reprendre la partie" sur la page d'accueil si la dernière partie est encore en cours.</li>
                        <li><span class="list-icon">💡</span>Gestion des déconnexions / reconnexions prolongées (fermeture de l'onglet / rafraîchissement).</li>
                        <li><span class="list-icon">💡</span>Le nom de l'auteur d'une image est désormais un hyperlien vers son profil.</li>
                        <li><span class="list-icon">🚀</span>Demande envoyée à Unsplash pour passage en production.</li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-07-06">06 / 07 / 2022</time>&nbsp;|&nbsp;version 0.0.7
                    </h2>
                    <ul>
                        <li><span class="list-icon">✨</span> Responsive. Pikt.ink est désormais utilisable sur tablette et smartphone.</li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-07-05">05 / 07 / 2022</time>&nbsp;|&nbsp;version 0.0.6
                    </h2>
                    <ul>
                        <li><span class="list-icon">✨</span> Badge Website Carbon Calculator !</li>
                        <li><span class="list-icon">💡</span> Gestion des déconnexions / reconnexions fortuites.</li>
                        <li><span class="list-icon">❌</span> Suppression de la fonctionnalité "Prêt / Pas Prêt" dans la salle d'attente :
                            pas assez intuitive en l'état.
                        </li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-07-04">04 / 07 / 2022</time>&nbsp;|&nbsp;version 0.0.5
                    </h2>
                    <ul>
                        <li><span class="list-icon">🐞</span> Correction d'un bug qui faisait crasher l'application lorsque le dernier
                            utilisateur quittait une partie dans certains conditions.
                        </li>
                        <li><span class="list-icon">🐞</span> Correction d'un bug qui empêcher d'afficher un ascenseur sur la page
                            d'accueil.
                        </li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-07-01">01 / 07 / 2022</time>&nbsp;|&nbsp;version 0.0.4
                    </h2>
                    <ul>
                        <li><span class="list-icon">✨</span> Refonte graphique.</li>
                        <li><span class="list-icon">✨</span> Les utilisateurs ont désormais des couleurs aléatoires dans le chat.</li>
                        <li><span class="list-icon">💡</span> Obtention des certificats HTTPS.</li>
                        <li><span class="list-icon">💡</span> Images selectionnées plus grandes.</li>
                        <li><span class="list-icon">💡</span> Le mot secret est désormais affiché à la fin d'un round.</li>
                        <li><span class="list-icon">🐞</span> Correction d'un bug qui empêchait le tchat de descendre lors de l'arrivée de
                            nouveaux messages sur Firefox.
                        </li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-06-30">30 / 06 / 2022</time>&nbsp;|&nbsp;version 0.0.3
                    </h2>
                    <ul>
                        <li><span class="list-icon">✨</span> Le joueur solo peut cliquer sur image pour la mettre en valeur.</li>
                        <li><span class="list-icon">✨</span> Les autres joueurs peuvent cliquer sur une image pour l'agrandir.</li>
                        <li><span class="list-icon">💡</span> Mise en place d'un reverse proxy sur le port 80.</li>
                        <li><span class="list-icon">💡</span> Renommage: "Pikt.ink".</li>
                        <li><span class="list-icon">💡</span> Changement dans le calcul des scores.</li>
                    </ul>
                </article>
                <hr/>
                <article>
                    <h2>
                        <time datetime="2022-06-29">29 / 06 / 2022</time>&nbsp;|&nbsp;version 0.0.2
                    </h2>
                    <ul>
                        <li><span class="list-icon">🐞</span> Correction du bouton "Prêt" dans la salle d'attente.</li>
                        <li><span class="list-icon">💡</span> Retrait de l'icône "Copier le lien" lorsque le
                            <pre class="inline">clipboard</pre>
                            n'est pas accessible.
                        </li>
                        <li><span class="list-icon">💡</span> Corrections orthographiques.</li>
                        <li><span class="list-icon">🚀</span> Optimisation de la requête de récupération d'images aléatoires. Il est
                            désormais possible de récupérer 1500 images / heure.
                        </li>
                    </ul>
                </article>
            </div>
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
        padding-bottom: 1rem;
        padding-left: 1rem;
    }

    .upper {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        gap: 2em;
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

    .articles {
        display: flex;
        flex-direction: column;
        margin-top: 1em;
        padding-right: 1em;
    }

    .list-icon {
        display: inline-block;
        width: 2em;
        text-align: center;
    }
</style>

