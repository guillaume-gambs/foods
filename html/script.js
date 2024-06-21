const FoodApp = {
    foods: [],
    filters: [],
    category_filters: [],
    rating_filters: [],

    init() {
        this.fetchFoods();
        this.setupEventListeners();
        this.applyFiltersFromURL();
    },

    fetchFoods() {
        fetch('foods.json')
            .then(response => response.json())
            .then(data => {
                this.foods = data;
                const categories = [...new Set(this.foods.map(food => food.category))];
                const rates = [...new Set(this.foods.map(food => food.rating))];
                this.displayCategory(categories);
                this.displayRate(rates);
                this.displayFoods(this.foods);
            });
    },

    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', () => this.search());
    },

    removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },

    search() {
        const input = this.removeAccents(document.getElementById('searchInput').value.toLowerCase());
        const filteredFoods = this.foods.filter(food => {
            const foodCategory = this.removeAccents(food.category.toLowerCase());
            const foodRating = food.rating;
            const foodName = this.removeAccents(food.name.toLowerCase());
            return (
                (
                this.filters.length === 0
                || this.filters.includes(foodCategory)
                )
                && (
                    foodCategory.includes(input)
                    || foodRating.toString().includes(input)
                    || foodName.includes(input)
                    )
            );
        });
        this.displayFoods(filteredFoods);
    },

    searchAdvance(column, input) {
        const filteredFoods = this.foods.filter(food => {
            let value;
            switch (column) {
                case 'name':
                    value = this.removeAccents(food.name.toLowerCase());
                    break;
                case 'rating':
                    value = food.rating.toString();
                    break;
                case 'category':
                    value = this.removeAccents(food.category.toLowerCase());
                    break;
                default:
                    return false;
            }
            return value.includes(input);
        });
        this.displayFoods(filteredFoods);
    },

    applyFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.category_filters = urlParams.get('filtersCategory') ? urlParams.get('filtersCategory').split(',') : [];
        this.rating_filters = urlParams.get('filtersRate') ? urlParams.get('filtersRate').split(',') : [];
        const tags = document.getElementsByClassName('tag');
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if (this.category_filters.includes(tag.textContent)) {
                tag.classList.add('selected');
            }
        }
        this.search();
    },

    getEmoji(rating) {
        switch (rating) {
            case -2:
                return '???';
            case -1:
                return '??';
            case 0:
                return "&#128561;";
            case 1:
                return '&#x1F92E;';
            case 2:
                return '&#x1F615;';
            case 3:
                return '&#x1F60A;';
            case 4:
                return '&#x1F60D;';
            case 5:
                return '&#x1F970;';
            default:
                return '';
        }
    },

    rateHumanize(rating) {
        switch (rating) {
            case -2:
                return 'Not set yet';
            case -1:
                return 'No idea';
            case 0:
                return 'I hate this';
            case 1:
                return "I don't like it";
            case 2:
                return 'Meh I can Eat';
            case 3:
                return 'I like it';
            case 4:
                return 'I love it';
            case 5:
                return "It's my favorite food";
            default:
                return '';
        }
    },

    displayFoods(foods) {
        const table = document.getElementById('foodTable');
        table.innerHTML = '';
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

            const emoji = this.getEmoji(food.rating);
            emojiTd.innerHTML = emoji;
            categoryTd.textContent = food.category;
            nameTd.textContent = food.name;

            tr.appendChild(emojiTd);
            tr.appendChild(categoryTd);
            tr.appendChild(nameTd);
            tr.className = `rating-${food.rating}`;

            table.appendChild(tr);
        });
    },

    createFilterButton(container, text, isActive, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'tag';
        if (isActive) {
            button.classList.add('selected');
        }
        button.onclick = onClick;
        container.appendChild(button);
    },

    displayCategory(categories) {
        const container = document.getElementById('tagCategory');
        container.innerHTML = '';
        categories.forEach(category => {
            this.createFilterButton(container, category, this.category_filters.includes(category), () => {
                if (this.category_filters.includes(category)) {
                    this.category_filters = this.category_filters.filter(filter => filter !== category);
                } else {
                    this.category_filters.push(category);
                }
                this.searchAdvance("category", category);
                window.history.pushState(null, '', '?filtersCategory=' + this.category_filters.join(','));
            });
        });
    },

    displayRate(rates) {
        const container = document.getElementById('tagRate');
        container.innerHTML = '';
        rates.sort((a, b) => a - b);
        rates.forEach(rate => {
            this.createFilterButton(container, this.rateHumanize(rate), this.rating_filters.includes(rate), () => {
                if (this.rating_filters.includes(rate)) {
                    this.rating_filters = this.rating_filters.filter(filter => filter !== rate);
                } else {
                    this.rating_filters.push(rate);
                }
                this.searchAdvance("rating", rate);
                window.history.pushState(null, '', '?filtersRate=' + this.rating_filters.join(','));
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => FoodApp.init());
