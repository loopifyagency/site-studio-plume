---
name: Studio Plume
description: La devanture de la rue de Lyon, de l'auvent au néon.
colors:
  honey: "#FAD27B"
  honey-light: "#FFE7A8"
  terracotta: "#C55E38"
  clay: "#9C4222"
  roast: "#2A140D"
  linen: "#FBF0DA"
  cream: "#FFF6E3"
  kraft: "#EBD3A5"
typography:
  display:
    fontFamily: "Young Serif, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(4.9rem, min(13.4vw, 21.5vh), 13rem)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(2.9rem, 7.4vw, 7.4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(1.9rem, 4.6vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.14em"
  script:
    fontFamily: "Sacramento, Segoe Script, cursive"
    fontSize: "1.22em"
    fontWeight: 400
    lineHeight: 0.8
rounded:
  card: "22px"
  button: "999px"
  arch: "999px 999px 24px 24px"
spacing:
  section: "clamp(6rem, 12vw, 11rem)"
  gutter: "clamp(1.25rem, 4.4vw, 4.5rem)"
components:
  button-ink:
    backgroundColor: "{colors.roast}"
    textColor: "{colors.cream}"
    rounded: "{rounded.button}"
    padding: "1.05em 1.9em"
  button-ink-hover:
    backgroundColor: "{colors.clay}"
  button-honey:
    backgroundColor: "{colors.honey}"
    textColor: "{colors.roast}"
    rounded: "{rounded.button}"
  button-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.roast}"
    rounded: "{rounded.button}"
  price-tag-linen:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.roast}"
    rounded: "{rounded.card}"
    padding: "3.4rem 2rem 2rem"
  price-tag-night:
    backgroundColor: "{colors.roast}"
    textColor: "{colors.cream}"
    rounded: "{rounded.card}"
  ticket-body:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.roast}"
    rounded: "16px"
---

# Design System: Studio Plume

## Overview

**Creative North Star: "La devanture de la rue de Lyon"**

Le site est la façade d'une petite boutique de Brest vue pendant une après-midi : lumière miel à l'ouverture, auvent de toile terracotta, puis le soir qui tombe jusqu'à l'allumage du néon « Studio Plume ». Ce n'est pas une décoration de boutique posée sur un gabarit : l'auvent festonné est l'en-tête et la jonction entre les sections, les photos vivent dans des fenêtres en arche, les prix pendent à des étiquettes. L'heure du jour est la palette.

La densité est généreuse et théâtrale : de très grands titres en serif épais, un script fin qui imite le tube du néon, des aplats pleine largeur. La chaleur vient de la matière (toile, kraft, bois torréfié) et de la lumière, jamais d'un dégradé décoratif. Le mouvement est lent et amorti, comme un store qu'on remonte.

**Key Characteristics:**
- Une plume au trait unique (tige et barbes) répétée partout : préchargeur, hero, rituel, appel à l'action, bandeau.
- Arches (fenêtres, carte, vignettes) et festons (auvent, jonctions de sections) comme seules formes signatures.
- Couleur par grandes plages : miel, terracotta et nuit torréfiée occupent des sections entières.
- Néon uniquement là où il existe réellement : l'enseigne du studio.
- Grain de papier kraft discret sur toute la page.

## Colors

Une palette de temps de la journée : deux couleurs imposées par le client (miel et terracotta), complétées par leurs variantes de lecture et trois neutres chauds.

### Primary
- **Miel du matin** (#FAD27B): lumière du jour. Fond du hero, des chiffres et des avis, en-tête, texte du néon. Couleur imposée.
- **Terracotta de toile** (#C55E38): l'auvent. Valance, bandeau, section des soins, appel à l'action, disque soleil. Couleur imposée. Réservée aux aplats et aux textes de grande taille (3,9:1 avec la crème).

### Secondary
- **Argile profonde** (#9C4222): terracotta assombrie pour tout ce qui se lit petit sur fond clair (liens, mot « Plume », soulignés de chiffres, survols). 4,5:1 et plus sur miel et lin.
- **Miel clair** (#FFE7A8): miel éclairci pour le script sur terracotta et sur nuit (3,4:1 sur terracotta, grand texte).

### Neutral
- **Brun torréfié** (#2A140D): nuit et encre. Fond des sections nocturnes, texte, boutons principaux.
- **Lin** (#FBF0DA): fond clair des cartes cadeaux et de « Nous trouver ». Jamais le fond par défaut de la page.
- **Crème** (#FFF6E3): texte sur fonds sombres ou terracotta, tickets.
- **Kraft** (#EBD3A5): papier des tickets cadeaux.

### Named Rules
**The Large-On-Terracotta Rule.** Sur terracotta, tout texte fait au moins 24 px, ou 18,66 px en gras. Le texte courant bascule sur lin, miel ou nuit.
**The Real Neon Rule.** Le halo lumineux n'existe que sur les enseignes qui reproduisent le néon du studio (préchargeur, étiquette du rituel, pied de page). Aucun autre élément ne rayonne.

## Typography

**Display Font:** Young Serif (Georgia en repli). **Body Font:** Figtree (system-ui en repli). **Script:** Sacramento, monoligne comme un tube de néon, uniquement pour les mots d'accent.

**Character:** un serif épais et chaleureux, presque artisanal, face à un sans humaniste neutre. Le script vient de l'enseigne et ne dépasse jamais un mot ou une courte phrase.

### Hierarchy
- **Display** (400, jusqu'à 13rem, 0.86): « Studio Plume » du hero, bornée aussi par la hauteur d'écran.
- **Headline** (400, clamp(2.9rem, 7.4vw, 7.4rem), 0.98): titres de section, mots révélés sous masque.
- **Title** (400, 1.9 à 3.2rem, 1.04): noms de soins, étapes du rituel.
- **Body** (400, 17 px, 1.6): mesure de 33 à 54 rem selon la colonne.
- **Label** (700, 0.8rem, 0.14em, capitales): durées sur les étiquettes, écriteau.
- **Script** (1.22 fois le titre, 0.8): le mot qui prend la couleur d'accent dans un titre.

### Named Rules
**The One Script Word Rule.** Un titre contient au plus un mot en script, toujours le dernier ou l'avant-dernier.

## Layout

Conteneur de 1520 px, gouttière fluide de 20 à 72 px. Les sections alternent des mises en page volontairement différentes : hero en deux colonnes asymétriques, rituel pinné texte et fenêtre, soins en défilement horizontal, phrase géante avec tampon, tickets inclinés, galerie décalée sur 12 colonnes, avis titre à gauche et citation à droite, carte dans une arche. Sous 900 px, tout passe en colonne ; le pin et le défilement horizontal sont remplacés par du natif (défilement avec accroche).

La jonction entre deux sections est toujours un feston de la couleur de la section précédente qui retombe sur la suivante.

## Elevation & Depth

Profondeur par ombre portée douce décalée vers le bas, et par superposition de plans (disque soleil, fenêtre, plume, écriteau). Pas de verre, pas de flou décoratif.

### Shadow Vocabulary
- **Fenêtre** (`0 46px 70px -34px rgba(42,20,13,.65)`): arches photo.
- **Étiquette** (`0 34px 44px -26px rgba(42,20,13,.65)`): étiquettes de prix, tickets (plus courte).
- **Néon** (`text-shadow` miel, 3 niveaux): enseignes seulement.

## Shapes

Arche (rayon haut de 999 px, bas de 22 à 26 px) pour toute image principale et pour la carte. Cercle pour le soleil, le tampon et une vignette. Pilule pour les boutons. Rectangles à 16 à 22 px pour étiquettes et tickets. Festons semi-circulaires de 14 à 23 px de rayon en bordure de section.

## Components

### Buttons
- **Shape:** pilule (999 px), bordure de 2 px.
- **Primary (ink):** fond brun, texte crème, remplissage argile qui monte au survol.
- **Honey / Cream / Line:** variantes pour fonds sombres et terracotta ; le remplissage change toujours la couleur du texte avec lui.
- **Hover / Focus:** remplissage animé (650 ms, expo), léger attrait magnétique du pointeur sur desktop, anneau de focus argile (miel sur fond sombre).

### Cards / Containers
- **Étiquette de prix:** rectangle à coins hauts de 22 px, trou et fil depuis le haut de l'écran, balancement au scroll, inclinaison 3D et reflet qui suit la souris.
- **Ticket cadeau:** talon coloré, perforation en pointillés, deux encoches.

### Navigation
- Barre miel de 68 px avec lambrequin festonné rayé terracotta et crème ; se masque à la descente, revient à la montée. Menu mobile plein écran nuit ouvert en cercle depuis le bouton.

### Signature Component: l'écriteau OUVERT / FERMÉ
Écriteau suspendu qui oscille doucement, calculé sur l'heure de Brest et les horaires réels.

## Do's and Don'ts

### Do:
- **Do** passer toute image principale par une arche ou un cercle.
- **Do** séparer les sections par un feston de la couleur de la section précédente.
- **Do** garder le miel et la terracotta en aplats larges ; les petits textes en argile, brun ou crème selon le fond.
- **Do** animer en `transform` et `opacity`, courbe expo, et prévoir la version `prefers-reduced-motion`.

### Don't:
- **Don't** mettre du texte courant sur terracotta.
- **Don't** faire briller autre chose que l'enseigne.
- **Don't** utiliser le lin comme fond par défaut ni faire de grilles de cartes identiques.
- **Don't** inventer des chiffres, avis ou titres : tout contenu vient du client.
