# Studio Plume · Clémence Autret

Site vitrine de l'institut de massages **Studio Plume** (46 rue de Lyon, 29200 Brest) : Kobido, drainage lymphatique méthode Vodder, cartes cadeaux. Action principale : prendre rendez-vous (Planity) ou appeler.

Site 100 % statique (HTML, CSS, JS), sans étape de build.

## Lancer en local

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Structure

| Chemin | Rôle |
|---|---|
| `index.html` | Page unique : contenus, SEO, JSON-LD `DaySpa` |
| `assets/css/styles.css` | Direction artistique « la devanture de la rue de Lyon » (jetons en tête de fichier) |
| `assets/js/main.js` | Mouvement (GSAP, ScrollTrigger, Lenis), menu, carrousel d'avis, état ouvert/fermé |
| `assets/vendor/` | GSAP 3.12.7, ScrollTrigger, Lenis 1.1.20 (locaux, aucun CDN) |
| `assets/fonts/` | Young Serif, Figtree, Sacramento (auto-hébergées, licence SIL OFL) |
| `assets/img/` | Photos du studio et texture de grain |
| `PRODUCT.md`, `DESIGN.md` | Contexte produit et système visuel (utilisés par les skills de design) |

## Contenus à tenir à jour

- **Prix, durées, horaires** : sections « Les soins », « Offrir », « Nous trouver » et JSON-LD dans `<head>`.
- **Offre madérothérapie** : « dès le 23 novembre » n'a pas d'année dans le brief ; à retirer ou à modifier dans `index.html` (carte `tag--night`) une fois l'offre terminée.
- **Lien de réservation** : `https://www.planity.com/studio-plume-clemence-autret-29200-brest` (le paramètre de suivi `fbclid` du brief a été retiré).
- **Avis** : repris mot pour mot ; ne pas les corriger (fautes d'origine comprises).

## Photos

Les 5 photos fournies mesurent 600 px de large et ont été agrandies ×2 (sans gain de détail). Les remplacer par les originaux haute définition (idéalement 2000 px de large, mêmes noms de fichiers, format WebP) améliorera nettement les grandes fenêtres du hero, du rituel et de la galerie.

## Accessibilité et performance

- `prefers-reduced-motion` : pas de préchargeur, pas de défilement fluide, pas de pin ; tout le contenu est visible.
- Sans JavaScript : le contenu reste lisible.
- Carrousel d'avis avec bouton pause, flèches clavier et pastilles ; menu mobile avec focus géré.
- Images en `loading="lazy"` sauf l'image du hero (préchargée).

## Mise en ligne (GitHub Pages)

Le workflow `.github/workflows/pages.yml` publie le site à chaque push sur `main` (ou à la demande, onglet **Actions** > *Déployer sur GitHub Pages* > *Run workflow*).

- Adresse : https://loopifyagency.github.io/site-studio-plume/
- Réglage unique, à faire une seule fois : **Settings > Pages > Build and deployment > Source : GitHub Actions**.
- Seuls `index.html`, `favicon.svg` et `assets/` sont publiés : les dossiers de conception (`.claude/`, `.impeccable/`) et `PRODUCT.md` / `DESIGN.md` restent hors du site.
- Tous les chemins du site sont relatifs, il fonctionne aussi bien sous `/site-studio-plume/` que sur un domaine personnalisé.

## Licences tierces

GSAP (licence GreenSock standard, gratuite), Lenis (MIT), polices SIL OFL.
