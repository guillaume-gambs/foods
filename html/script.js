
let foods = [];
let filters = [];

fetch('foods.json')
    .then(response => response.json())
    .then(data => {
        foods = data;
        const categories = [...new Set(foods.map(food => food.category))];
        const rates = [...new Set(foods.map(food => food.rating))];
        displayCategory(categories);
        displayRate(rates);
        displayFoods(foods);
    });

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function search() {
    const input = removeAccents(document.getElementById('searchInput').value.toLowerCase());
    const filteredFoods = foods.filter(food => {
        const foodCategory = removeAccents(food.category.toLowerCase());
        const foodRating = food.rating;
        const foodName = removeAccents(food.name.toLowerCase());
        return (
            (filters.length === 0 || filters.includes(foodCategory)) &&
            (foodCategory.includes(input) || foodRating.toString().includes(input) || foodName.includes(input))
        );
    });
    displayFoods(filteredFoods);
}

function searchAdvance(column, input) {
    input = removeAccents(input.toLowerCase());
    const filteredFoods = foods.filter(food => {
        let value;
        switch (column) {
            case 'name':
                value = removeAccents(food.name.toLowerCase());
                break;
            case 'rating':
                value = food.rating.toString();
                break;
            case 'category':
                value = removeAccents(food.category.toLowerCase());
                break;
            default:
                return false;
        }
        return value.includes(input);
    });
    displayFoods(filteredFoods);
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    filters = urlParams.get('filters') ? urlParams.get('filters').split(',') : [];
    // Mettez à jour l'interface utilisateur tag.classList selon les filtres
    const tags = document.getElementsByClassName('tag');
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (filters.includes(tag.textContent)) {
            tag.classList.add('selected');
        }
    }
    search();
};

function getEmoji(rating) {
    switch (rating) {
        case -2:
            return '???' ; // Not Set Yet
        case -1:
            return '??' ; // Je ne sais pas
        case 0:
            return "&#128561;"; // Fear
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

function displayCategory(categories) {
    const container = document.getElementById('tagCategory');
    container.innerHTML = '';
    categories.forEach(category => {
        const tag = document.createElement('button');
        tag.textContent = category;
        tag.className = 'tag';
        tag.onclick = function() {
            if (filters.includes(category)) {
                filters = filters.filter(filter => filter !== category);
                tag.classList.remove('selected');
            } else {
                filters.push(category);
                tag.classList.add('selected');
            }
            searchAdvance("category",category);
            window.history.pushState(null, '', '?filters=' + filters.join(','));
        };
        container.appendChild(tag);
    });
}


function displayRate(rates) {
    const container = document.getElementById('tagRate');
    container.innerHTML = '';
    rates.forEach(rates => {
        const tag = document.createElement('button');
        tag.textContent = rates;
        tag.className = 'tag';
        tag.onclick = function() {
            if (filters.includes(rate)) {
                filters = filters.filter(filter => filter !== rate);
                tag.classList.remove('selected');
            } else {
                filters.push(category);
                tag.classList.add('selected');
            }
            search();
            window.history.pushState(null, '', '?filters=' + filters.join(','));
        };
        container.appendChild(tag);
    });
}