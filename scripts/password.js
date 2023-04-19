import * as argon2 from "argon2";
import {
  isDir,
  isFile,
  readJSON,
  render404,
  response302,
} from "../src/utils.js";

const password = "12341234";

const options = ;
const hashedPassword = await argon2.hash(password,{
  timeCost: 4,
  hashLength: 16,
} )
const hashedSplit = hashedPassword.split("=");
const hash = hashedSplit[4];

const passHash = "4$5IUzEI9vX3iN7x7Qd6FkfA$irntlmWAADwM1y7ElQZQLg";
const verify = await argon2.verify(
  `$argon2id$v=19$m=65536,t=4,p=${passHash}`,
  password
);
console.log({ verify });*


/*
$argon2i$v=19$m=65536,t=3,p=1$YOtX2//7NoD/owm8RZ8llw==$fPn4sPgkFAuBJo3M3UzcGss3dJysxLJdPdvojRF20ZE=

argon2{i}trois types i,d,id

Argon2d est plus rapide et utilise un accès mémoire dépendant des données. La dépendance aux données active immédiatement le canal latéral. Cela convient aux crypto-monnaies et aux applications sans menaces d'attaques par canal latéral.
Argon2i utilise un accès mémoire indépendant des données, ce qui est préféré pour le hachage de mot de passe et les dérivations de clés basées sur un mot de passe.

Argon2id Dans la première moitié de la première itération fonctionne comme Argon2i et le reste fonctionne comme Argon2d. Cela permet à la fois la protection des canaux latéraux et le compromis temps-mémoire.

Et si vous ne connaissez pas la différence ou si vous considérez les attaques par canal auxiliaire comme des menaces viables, utilisez Argon2id .

De meilleurs conseils Use Argon2id unless you know you have a good reason to use any other modepar MechMK1

v=19- vpour la version, ici la version est 19

m=65536- mest l'entier représentant le coût mémoire variable, en kibioctets ici 65536 kibioctets.

t- est l'entier représentant le coût de synchronisation variable en itération linéaire, ici 3.

p=1- pest le mécanisme de parallélisation pour contrôler la quantité de parellisation

sel - iciYOtX2//7NoD/owm8RZ8llw==

résumé - icifPn4sPgkFAuBJo3M3UzcGss3dJysxLJdPdvojRF20ZE=

Divisé avec $signe, le dernier jeton est le résumé et celui avant le dernier jeton est le sel.


LIEN CONTOURNEMENT : https://github.com/ranisalt/node-argon2/issues/311

*/
