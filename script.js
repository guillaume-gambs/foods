
let foods = [];
let filters = [];
category_filters = [];
rating_filters = [];

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
            (
            filters.length === 0 
            || filters.includes(foodCategory)
            ) 
            && (
                foodCategory.includes(input) 
                || foodRating.toString().includes(input) 
                || foodName.includes(input)
                )
        );
    });
    displayFoods(filteredFoods);
}

function searchAdvance(column, input) {
    // input = removeAccents(input.toLowerCase());
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

window.onload = function () {
    /**
     * URLSearchParams object representing the query parameters of the current window location.
     * @type {URLSearchParams}
     */
    const urlParams = new URLSearchParams(window.location.search);
    category_filters = urlParams.get('filtersCategory') ? urlParams.get('filtersCategory').split(',') : [];
    rating_filters = urlParams.get('filtersRate') ? urlParams.get('filtersRate').split(',') : [];
    // Mettez à jour l'interface utilisateur tag.classList selon les filtres
    const tags = document.getElementsByClassName('tag');
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (category_filters.includes(tag.textContent)) {
            tag.classList.add('selected');
        }
    }
    search();
};

function getEmoji(rating) {
    switch (rating) {
        case -2:
            return '???'; // Not Set Yet
        case -1:
            return '??'; // Je ne sais pas
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

function rateHumanize(rating) {
    switch (rating) {
        case -2:
            return 'Not set yet'; // Not Set Yet
        case -1:
            return 'No idea'; // Je ne sais pas
        case 0:
            return 'I hate this' // Fear
        case 1:
            return "I don't like it"; // Vomit
        case 2:
            return 'Meh I can Eat'; // Mitigé
        case 3:
            return 'I like it'; // Aime
        case 4:
            return 'I love it'; // Adore
        case 5:
            return "It 's my favorite food"; // Adore
        default:
            return '';
    }
}
/**
 * Displays a list of foods in a table.
 *
 * @param {Array} foods - The list of foods to display.
 */
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
        const tag_category = document.createElement('button');
        tag_category.textContent = category;
        tag_category.className = 'tag';
        tag_category.onclick = function () {
            if (category_filters.includes(category)) {
                category_filters = category_filters.filter(filter => filter !== category);
                tag_category.classList.remove('selected');
            } else {
                category_filters.push(category);
                tag_category.classList.add('selected');
            }
            searchAdvance("category", category);
            window.history.pushState(null, '', '?filtersCategory=' + category_filters.join(','));
        };
        container.appendChild(tag_category);
    });
}



/**
 * Displays the rates in the container element.
 * @param {number[]} rates - The rates to be displayed.
 */
function displayRate(rates) {
    const container = document.getElementById('tagRate');
    container.innerHTML = '';
    rates.sort((a, b) => a - b); // Sort the rates in ascending order
    rates.forEach(rate => {
        const tag_rate = document.createElement('button');
        tag_rate.textContent = rateHumanize(rate);
        tag_rate.className = 'tag';
        tag_rate.onclick = function () {
            if (rating_filters.includes(rate)) {
                rating_filters = rating_filters.filter(filter => filter !== rate);
                tag_rate.classList.remove('selected');
            } else {
                rating_filters.push(rate);
                tag_rate.classList.add('selected');
            }
            // search();
            searchAdvance("rating", rate);
            window.history.pushState(null, '', '?filtersRate=' + rating_filters.join(','));
        };
        container.appendChild(tag_rate);
    });
}