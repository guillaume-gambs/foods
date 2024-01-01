
let foods = [];

fetch('foods.json')
    .then(response => response.json())
    .then(data => {
        foods = data;
        const categories = [...new Set(foods.map(food => food.category))];
        displayTags(categories);
        displayFoods(foods);
    });

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function search() {
    const input = removeAccents(document.getElementById('searchInput').value.toLowerCase());
    const filteredFoods = foods.filter(food => removeAccents(food.name.toLowerCase()).includes(input));

    displayFoods(filteredFoods);
}

function getEmoji(rating) {
    switch (rating) {
        case -2:
            return '???' ; // Not Set Yet
        case -1:
            return '??' ; // Je ne sais pas
        case 0:
            return "&#128513;"; // Fear
        case 1:
            return '&#x1F92E;'; // Vomit
        case 2:
            return '&#x1F615;'; // Mitigé
        case 3:
            return '&#x1F60A;'; // Aime
        case 4:
            return '&#x1F60D;'; // Adore
        case 5:
            return '&#x1F970;'; // Adore
        default:
            return '';
    }
}

function displayFoods(foods) {
    const table = document.getElementById('foodTable');
    table.innerHTML = '';

    // Créer l'en-tête du tableau
    const header = document.createElement('tr');
    const emojiTh = document.createElement('th');
    const categoryTh = document.createElement('th');
    const nameTh = document.createElement('th');

    emojiTh.textContent = 'Emoji';
    categoryTh.textContent = 'Category';
    nameTh.textContent = 'Name';

    header.appendChild(emojiTh);
    header.appendChild(categoryTh);
    header.appendChild(nameTh);
    table.appendChild(header);
    
    foods.forEach(food => {
        const tr = document.createElement('tr');
        const emojiTd = document.createElement('td');
        const categoryTd = document.createElement('td');
        const nameTd = document.createElement('td');

        const emoji = getEmoji(food.rating);
        emojiTd.innerHTML = emoji;
        categoryTd.textContent = food.category;
        nameTd.textContent = food.name;

        tr.appendChild(emojiTd);
        tr.appendChild(categoryTd);
        tr.appendChild(nameTd);
        tr.className = `rating-${food.rating}`;

        table.appendChild(tr);
    });
}

function displayTags(categories) {
    const container = document.getElementById('tagContainer');
    container.innerHTML = '';
    categories.forEach(category => {
        const tag = document.createElement('button');
        tag.textContent = category;
        tag.className = 'tag';
        tag.onclick = function() {
            document.getElementById('searchInput').value = category;
            search();
        };
        container.appendChild(tag);
    });
}