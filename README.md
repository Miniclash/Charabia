# Charabia

Studio de voix-charabia (« mumble speak », *voice blips*) pour personnages de jeu vidéo : le texte s'affiche et le perso babille en même temps, façon Animal Crossing, Undertale ou Banjo-Kazooie.

Tout est synthétisé en direct avec la Web Audio API. Aucun sample, aucun serveur, aucune dépendance.

## Lancer le studio

Ouvre `index.html` dans un navigateur, ou sers le dossier avec n'importe quel serveur statique :

```sh
python3 -m http.server
```

## Structure

| Fichier | Rôle |
|---|---|
| `src/charabia.js` | Le moteur : analyse du texte (FR/EN), prosodie, humeurs, synthèse à formants, code de voix. |
| `src/creature.js` | Les créatures ( + bouche calée sur les voyelles). |
| `src/studio.js` | L'interface du studio. |
| `css/studio.css` | Le style de l'interface (pixel CRT). |
| `data/repliques.js` | Les répliques proposées par le studio, en français et en anglais. À éditer librement. |
| `data/personnages.js` | Les personnages du deck : nom, rôle, réplique fétiche et voix (réglages ou code `MUMBLE1.`). À éditer librement. |
| `examples/minimal.html` | Utiliser le moteur seul, sans le studio. |

## Utiliser le moteur dans un jeu

```html
<script src="charabia.js"></script>
<script>
  const voix = Charabia.decode('MUMBLE1.…');      // code copié depuis le studio
  bouton.onclick = () => {
    const h = Charabia.speak('Salut, voyageur !', voix);
    // h.timeline.events : chaque événement a t (s), step, s/e (index des caractères dans le texte)
    // h.start : instant de départ en temps AudioContext (Charabia.now())
  };
</script>
```

- `Charabia.speak(texte, voix, { audioContext })` joue une réplique. Passe ton propre `AudioContext` pour mixer avec le reste du jeu.
- `Charabia.stop()` coupe la réplique en cours.
- `Charabia.build(texte, voix)` calcule la partition sans jouer de son (utile pour caler l'affichage du texte).
- `Charabia.encode(voix)` / `Charabia.decode(code)` convertissent entre objet voix et code `MUMBLE1.…`. `decode` accepte aussi le JSON exporté par le studio.

Les navigateurs n'autorisent le son qu'après une interaction de l'utilisateur : appelle `speak` (ou `Charabia.unlock()`) depuis un clic ou une touche.

## Format de voix

Un objet simple ; toute clé absente prend sa valeur par défaut (`Charabia.DEFAULT`), toute valeur hors bornes est ramenée dans `Charabia.NUM` / `Charabia.ENUM`. Le code `MUMBLE1.` est ce même objet, en tableau JSON encodé en base64url, dans l'ordre de `Charabia.KEYS`.
