const emojiMappings = {
    '-2': { emoji: '❓', humanized: 'Not set yet' },
    '-1': { emoji: '&#x1F914;', humanized: 'No idea' },
    '0': { emoji: '&#128561;', humanized: 'I hate this' },
    '1': { emoji: '&#x1F92E;', humanized: "I don't like it" },
    '2': { emoji: '&#x1F615;', humanized: 'Meh I can Eat' },
    '3': { emoji: '&#x1F60A;', humanized: 'I like it' },
    '4': { emoji: '&#x1F60D;', humanized: 'I love it' },
    '5': { emoji: '&#x1F970;', humanized: "It's my favorite food" }
};

const FoodApp = {
    foods: [],
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
                this.search();
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
            const foodRating = food.rating.toString();
            const foodName = this.removeAccents(food.name.toLowerCase());

            const matchesCategoryFilter = this.category_filters.length === 0 || this.category_filters.includes(food.category);
            const matchesRatingFilter = this.rating_filters.length === 0 || this.rating_filters.includes(food.rating.toString());
            const matchesSearch = foodCategory.includes(input) || foodRating.includes(input) || foodName.includes(input);

            return matchesCategoryFilter && matchesRatingFilter && matchesSearch;
        });
        this.displayFoods(filteredFoods);
    },

    applyFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.category_filters = urlParams.get('filtersCategory') ? urlParams.get('filtersCategory').split(',') : [];
        this.rating_filters = urlParams.get('filtersRate') ? urlParams.get('filtersRate').split(',') : [];
        this.updateCategoryTagSelection();
        this.updateRatingTagSelection();
        this.search();
    },

    updateCategoryTagSelection() {
        const categoryTags = document.querySelectorAll('#tagCategory .tag');
        categoryTags.forEach(tag => {
            if (this.category_filters.includes(tag.textContent)) {
                tag.classList.add('selected');
            } else {
                tag.classList.remove('selected');
            }
        });
    },

    updateRatingTagSelection() {
        const ratingTags = document.querySelectorAll('#tagRate .tag');
        ratingTags.forEach(tag => {
            if (this.rating_filters.includes(tag.dataset.rating)) {
                tag.classList.add('selected');
            } else {
                tag.classList.remove('selected');
            }
        });
    },

    getEmoji(rating) {
        return emojiMappings[rating.toString()] ? emojiMappings[rating.toString()].emoji : '';
    },

    rateHumanize(rating) {
        return emojiMappings[rating.toString()] ? emojiMappings[rating.toString()].humanized : '';
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

    createFilterButton(container, text, isActive, onClick, dataAttr) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'tag';
        if (isActive) {
            button.classList.add('selected');
        }
        if (dataAttr) {
            button.dataset.rating = dataAttr;
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
                this.updateURLParams();
                this.updateCategoryTagSelection();
                this.search();
            });
        });
    },

    displayRate(rates) {
        const container = document.getElementById('tagRate');
        container.innerHTML = '';
        rates.sort((a, b) => a - b);
        rates.forEach(rate => {
            const rateStr = rate.toString();
            this.createFilterButton(container, this.rateHumanize(rate), this.rating_filters.includes(rateStr), () => {
                if (this.rating_filters.includes(rateStr)) {
                    this.rating_filters = this.rating_filters.filter(filter => filter !== rateStr);
                } else {
                    this.rating_filters.push(rateStr);
                }
                this.updateURLParams();
                this.updateRatingTagSelection();
                this.search();
            }, rateStr);
        });
    },

    updateURLParams() {
        const urlParams = new URLSearchParams();
        if (this.category_filters.length > 0) {
            urlParams.set('filtersCategory', this.category_filters.join(','));
        }
        if (this.rating_filters.length > 0) {
            urlParams.set('filtersRate', this.rating_filters.join(','));
        }
        window.history.pushState(null, '', '?' + urlParams.toString());
    }
};

document.addEventListener('DOMContentLoaded', () => FoodApp.init());
