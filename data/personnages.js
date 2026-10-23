/*
 * Personnages du deck (les cartes en bas du studio).
 *
 * Chaque personnage :
 *   nom   : nom affiché sur la carte et dans la bulle
 *   role  : petite ligne au-dessus du portrait
 *   fr/en : sa réplique fétiche, jouée quand on pioche la carte
 *   voix  : réglages de la voix (toute clé absente prend sa valeur par défaut)
 *     OU
 *   code  : un code de voix « MUMBLE1.… » copié depuis le studio.
 *           C'est le plus simple : réglez la voix dans le studio, copiez le code, collez-le ici.
 *
 * Réglages de « voix » (entre parenthèses : bornes ou valeurs possibles)
 *   age (4–90), gender (0 féminin – 100 masculin), size (0 minuscule – 100 colossal)
 *       → ces trois-là calculent automatiquement pitch, formant, speed, vib, jitter, breath,
 *         sauf si vous les précisez vous-même.
 *   hue (0–359)        couleur de la créature
 *   seed (0–9999)      graine de la mélodie propre au perso
 *   mood               normal, joyeux, triste, effraye, furieux, ivre, atone, endormi,
 *                      chuchote, robot, surexcite, enrhume
 *   moodAmt (0–100)    intensité de l'humeur
 *   src                voix, bip, doux, chip, souffle
 *   grain              lettre, syllabe, mot
 *   scale              libre, penta, majeur, chroma
 *   speed (3–28), pitchVar (0–8), inton, pauses, breath, artic, vib, jitter, crunch, echo, vol (0–100),
 *   pitch (50–700 Hz), formant (0.6–1.7), gate (25–130)
 */
window.CHARABIA_PERSONNAGES = [
  {
    nom: "Pip", role: "L'apprenti",
    fr: "Salut, voyageur ! Tu cherches quelque chose ?",
    en: "Hi there, traveler! Looking for something?",
    voix: { seed: 12, hue: 150, age: 10, gender: 45, size: 28, mood: "joyeux", moodAmt: 60, pitchVar: 2.6 },
  },
  {
    nom: "Odette", role: "La doyenne",
    fr: "Ah, la jeunesse… De mon temps, on marchait jusqu'au village.",
    en: "Ah, youth... Back in my day, we walked all the way to the village.",
    voix: { seed: 301, hue: 285, age: 84, gender: 12, size: 40, pitchVar: 2 },
  },
  {
    nom: "Gorbak", role: "Le troll du pont",
    fr: "VA-T'EN ! C'est MON pont, pas le tien !",
    en: "GET OFF! This is MY bridge, not yours!",
    voix: { seed: 66, hue: 95, age: 40, gender: 92, size: 96, mood: "furieux", moodAmt: 75, echo: 20 },
  },
  {
    nom: "Lilou", role: "La fée",
    fr: "Tu as vu les lucioles ? Elles chantent la nuit !",
    en: "Did you see the fireflies? They sing at night!",
    voix: { seed: 7, hue: 320, age: 19, gender: 10, size: 4, mood: "joyeux", moodAmt: 40, src: "doux", grain: "lettre", scale: "penta", pitchVar: 4, gate: 55, echo: 25 },
  },
  {
    nom: "K-7", role: "L'automate",
    fr: "Analyse terminée. Aucune forme de vie détectée.",
    en: "Scan complete. No life forms detected.",
    voix: { seed: 7007, hue: 200, age: 30, gender: 50, size: 55, mood: "robot", moodAmt: 100, src: "chip" },
  },
  {
    nom: "Barnabé", role: "Le matelot",
    fr: "Encore un verre et j'te raconte la tempête de 1812…",
    en: "One more round an' I'll tell ya 'bout the storm of 1812...",
    voix: { seed: 888, hue: 28, age: 56, gender: 80, size: 70, mood: "ivre", moodAmt: 80 },
  },
  {
    nom: "Ombre", role: "Le spectre",
    fr: "Ne descends pas à la cave… elle t'attend.",
    en: "Don't go down to the cellar... it's waiting for you.",
    voix: { seed: 404, hue: 235, age: 45, gender: 50, size: 60, mood: "chuchote", moodAmt: 100, speed: 8, echo: 65 },
  },
  {
    nom: "Bobo", role: "Le marchand",
    fr: "Bienvenue ! Tout est à moitié prix, enfin presque.",
    en: "Welcome! Everything's half price. Well, almost.",
    voix: { seed: 150, hue: 45, age: 35, gender: 60, size: 50, src: "bip", grain: "lettre", speed: 18, pitchVar: 0.6, gate: 45, pitch: 180, artic: 20 },
  },
  {
    nom: "Firmin", role: "Le garde",
    fr: "Halte… qui va là… bon, tant pis, je dors.",
    en: "Halt... who goes there... eh, never mind, I'm sleeping.",
    voix: { seed: 31, hue: 10, age: 48, gender: 75, size: 75, mood: "endormi", moodAmt: 85 },
  },
  {
    nom: "Krik", role: "Le gobelin",
    fr: "N-non ! J'ai rien volé, c'était déjà comme ça !",
    en: "N-no! I didn't steal it, it was already like that!",
    voix: { seed: 2, hue: 110, age: 25, gender: 55, size: 12, mood: "effraye", moodAmt: 85 },
  },
];
