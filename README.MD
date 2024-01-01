# Guillaume Gastronomic Gauge

Ceci est un petit programme qui aide mes amis et ma famille a savoir si j'aime un aliment, plat....

Il s'agit d'un petit moteur de recherche dans lequel on tape un mot ou plusieurs et cela affiche une note comprise entre 

## test

Build

```bash
docker build -t ggg:v1 .
```

Run

```bash
docker rm -f test-ggg ; docker run -d -p 80:80 -v ./html:/usr/share/nginx/html/ --name test-ggg ggg:v1
```

test on http://localhost/

todo: 
- Si l'aliment nexiste pas, faire une sugestion d'ajout
- Filtrer par category
- Faire une page de jeu ou les gens doivent deviner si j'aime ou pas
- Permettre les alias d'aliments