# Guillaume Gastronomic Gauge

Ceci est un petit programme qui aide mes amis et ma famille à savoir si j'aime un aliment, plat....

Il s'agit d'un petit moteur de recherche dans lequel on tape un début de mot et cela affiche une note comprise entre 0 et 5.
On peut également filter par catégorie d'aliments, ou par note ou les deux.

## test

### Build

```bash
docker build -t foods-like:v1 .
```

### Run

```bash
docker rm -f test-foods-like ; docker run -d -p 80:80 -v ./html:/usr/share/nginx/html/ --name test-foods-like foods-like:v1
```

On peut le tester sur http://localhost/

TODO:
- Si l'aliment n'existe pas, faire une sugestion d'ajout
- Faire une page de jeu ou les gens doivent deviner si j'aime ou pas
- Permettre les alias d'aliments