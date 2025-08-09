// Mapping des émojis et descriptions
const emojiMappings = {
    '': { emoji: '❓', humanized: 'Pas noté' },
    '0': { emoji: '😖', humanized: 'Je déteste' },
    '1': { emoji: '😞', humanized: "Je n'aime pas" },
    '2': { emoji: '😐', humanized: 'Bof' },
    '3': { emoji: '😋', humanized: "J'aime" },
    '4': { emoji: '😍', humanized: "J'adore" },
    '5': { emoji: '🤩', humanized: 'Mon favori' }
};

// Application principale
class FoodApp {
    constructor() {
        this.foods = [];
        this.categoryFilters = [];
        this.ratingFilters = [];

        // État du jeu
        this.gameState = {
            score: 0,
            streak: 0,
            total: 0,
            currentFood: null,
            answered: false,
            usedFoods: []
        };

        // Suggestions stockées localement
        this.suggestions = this.loadSuggestions();

        this.init();
    }

    async init() {
        await this.loadFoods();
        this.setupEventListeners();
        this.initializeFilters();
        this.initializeSuggestForm();
        this.displaySuggestions();
        this.search();
        this.updateGameStats();
    }

    async loadFoods() {
        try {
            const response = await fetch('foods.json');
            this.foods = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            // Fallback avec quelques données de base
            this.foods = [
                {"name": "Pomme", "category": "Fruit", "rating": 4},
                {"name": "Brocoli", "category": "Légume", "rating": 4}
            ];
        }
    }

    setupEventListeners() {
        // Mode switcher
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Recherche
        document.getElementById('searchInput').addEventListener('input', () => this.search());

        // Boutons de jeu
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.makeGuess(e.target.dataset.choice));
        });

        // Formulaire de suggestion
        document.getElementById('suggestBtn').addEventListener('click', () => this.submitSuggestion());
    }

    switchMode(mode) {
        // Mettre à jour les boutons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Afficher le bon panel
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${mode}-panel`);
        });
    }

    removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    initializeFilters() {
        // Générer les filtres de catégories
        const categories = [...new Set(this.foods.map(food => food.category))].sort();
        const categoryContainer = document.getElementById('categoryFilters');
        categoryContainer.innerHTML = '';

        categories.forEach(category => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.textContent = category;
            tag.addEventListener('click', () => this.toggleCategoryFilter(category));
            categoryContainer.appendChild(tag);
        });

        // Générer les filtres de ratings
        const ratings = [...new Set(this.foods.map(food => food.rating))].sort((a, b) => {
            if (a === '') return -1;
            if (b === '') return 1;
            return a - b;
        });
        const ratingContainer = document.getElementById('ratingFilters');
        ratingContainer.innerHTML = '';

        ratings.forEach(rating => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.textContent = emojiMappings[rating].humanized;
            tag.dataset.rating = rating;
            tag.addEventListener('click', () => this.toggleRatingFilter(rating));
            ratingContainer.appendChild(tag);
        });
    }

    initializeSuggestForm() {
        const categories = [...new Set(this.foods.map(food => food.category))].sort();
        const select = document.getElementById('suggestCategory');
        select.innerHTML = '<option value="">Choisir une catégorie</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });

        // Option pour nouvelle catégorie
        const newCategoryOption = document.createElement('option');
        newCategoryOption.value = 'new';
        newCategoryOption.textContent = '➕ Nouvelle catégorie';
        select.appendChild(newCategoryOption);

        select.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                const newCategory = prompt('Nom de la nouvelle catégorie :');
                if (newCategory && newCategory.trim()) {
                    const option = document.createElement('option');
                    option.value = newCategory.trim();
                    option.textContent = newCategory.trim();
                    select.insertBefore(option, select.lastElementChild);
                    select.value = newCategory.trim();
                }
            }
        });
    }

    toggleCategoryFilter(category) {
        const index = this.categoryFilters.indexOf(category);
        if (index > -1) {
            this.categoryFilters.splice(index, 1);
        } else {
            this.categoryFilters.push(category);
        }
        this.updateFilterDisplay();
        this.search();
    }

    toggleRatingFilter(rating) {
        const index = this.ratingFilters.indexOf(rating);
        if (index > -1) {
            this.ratingFilters.splice(index, 1);
        } else {
            this.ratingFilters.push(rating);
        }
        this.updateFilterDisplay();
        this.search();
    }

    updateFilterDisplay() {
        // Mettre à jour l'apparence des filtres de catégories
        document.querySelectorAll('#categoryFilters .tag').forEach(tag => {
            tag.classList.toggle('selected', this.categoryFilters.includes(tag.textContent));
        });

        // Mettre à jour l'apparence des filtres de ratings
        document.querySelectorAll('#ratingFilters .tag').forEach(tag => {
            tag.classList.toggle('selected', this.ratingFilters.includes(tag.dataset.rating));
        });
    }

    search() {
        const input = this.removeAccents(document.getElementById('searchInput').value.toLowerCase());

        const filteredFoods = this.foods.filter(food => {
            const matchesCategoryFilter = this.categoryFilters.length === 0 ||
                this.categoryFilters.includes(food.category);
            const matchesRatingFilter = this.ratingFilters.length === 0 ||
                this.ratingFilters.includes(food.rating);
            const matchesSearch = input === '' ||
                this.removeAccents(food.name.toLowerCase()).includes(input) ||
                this.removeAccents(food.category.toLowerCase()).includes(input);

            return matchesCategoryFilter && matchesRatingFilter && matchesSearch;
        });

        this.displayFoods(filteredFoods);
    }

    displayFoods(foods) {
        const tbody = document.getElementById('foodTableBody');
        tbody.innerHTML = '';

        foods.forEach(food => {
            const tr = document.createElement('tr');
            const ratingClass = food.rating === '' ? 'rating-empty' : `rating-${food.rating}`;
            tr.className = ratingClass;

            tr.innerHTML = `
                <td class="emoji-cell">${emojiMappings[food.rating].emoji}</td>
                <td>${food.category}</td>
                <td>${food.name}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    // Fonctions du jeu
    nextQuestion() {
        // Filtrer seulement les aliments avec une note (pas vides)
        const ratedFoods = this.foods.filter(food => food.rating !== '');

        // Réinitialiser si tous les aliments ont été utilisés
        if (this.gameState.usedFoods.length >= ratedFoods.length) {
            this.gameState.usedFoods = [];
        }

        // Sélectionner un aliment aléatoire non utilisé
        const availableFoods = ratedFoods.filter(food =>
            !this.gameState.usedFoods.includes(food.name)
        );

        if (availableFoods.length === 0) {
            this.gameState.usedFoods = [];
            this.nextQuestion();
            return;
        }

        const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
        this.gameState.currentFood = randomFood;
        this.gameState.usedFoods.push(randomFood.name);
        this.gameState.answered = false;

        // Mettre à jour l'affichage
        document.getElementById('currentFood').textContent = randomFood.name;
        document.getElementById('currentCategory').textContent = randomFood.category;
        document.getElementById('choiceButtons').style.display = 'flex';
        document.getElementById('result').style.display = 'none';
        document.getElementById('nextBtn').textContent = 'Nouvelle question';

        // Réinitialiser les boutons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.disabled = false;
        });
    }

    makeGuess(guess) {
        if (this.gameState.answered || !this.gameState.currentFood) return;

        this.gameState.answered = true;
        this.gameState.total++;

        const actualRating = this.gameState.currentFood.rating;

        // Définir les catégories
        const dislikeRatings = [0, 1]; // Je déteste, Je n'aime pas
        const likeRatings = [2, 3, 4, 5]; // Bof, J'aime, J'adore, Mon favori

        // Vérifier si la prédiction est correcte
        const actualCategory = dislikeRatings.includes(actualRating) ? 'dislike' : 'like';
        const correct = guess === actualCategory;

        const resultDiv = document.getElementById('result');

        if (correct) {
            this.gameState.score++;
            this.gameState.streak++;
            resultDiv.className = 'result correct';
            resultDiv.innerHTML = `
                <div>🎉 Correct ! Guillaume ${emojiMappings[actualRating].humanized.toLowerCase()} ${this.gameState.currentFood.name}</div>
                <div style="margin-top: 10px; font-size: 1rem;">Note exacte : ${emojiMappings[actualRating].emoji} ${emojiMappings[actualRating].humanized}</div>
                <div style="margin-top: 10px; font-size: 1rem;">Série de ${this.gameState.streak} bonnes réponses !</div>
            `;
        } else {
            this.gameState.streak = 0;
            resultDiv.className = 'result incorrect';
            const expectedText = guess === 'like' ? "aime" : "n'aime pas";
            resultDiv.innerHTML = `
                <div>❌ Incorrect ! Vous pensiez qu'il ${expectedText} cet aliment</div>
                <div style="margin-top: 10px; font-size: 1rem;">En réalité, Guillaume ${emojiMappings[actualRating].humanized.toLowerCase()} ${this.gameState.currentFood.name}</div>
                <div style="margin-top: 10px; font-size: 1rem;">Note exacte : ${emojiMappings[actualRating].emoji} ${emojiMappings[actualRating].humanized}</div>
            `;
        }

        resultDiv.style.display = 'block';
        document.getElementById('choiceButtons').style.display = 'none';

        this.updateGameStats();
    }

    updateGameStats() {
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('streak').textContent = this.gameState.streak;
        document.getElementById('total').textContent = this.gameState.total;
    }

    // Fonctions de suggestion
    submitSuggestion() {
        const name = document.getElementById('suggestName').value.trim();
        const category = document.getElementById('suggestCategory').value;
        const description = document.getElementById('suggestDescription').value.trim();

        if (!name || !category) {
            alert('Veuillez remplir au moins le nom et la catégorie de l\'aliment.');
            return;
        }

        // Vérifier si l'aliment existe déjà
        const exists = this.foods.some(food =>
            food.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            alert('Cet aliment existe déjà dans la liste !');
            return;
        }

        // Vérifier si la suggestion existe déjà
        const suggestionExists = this.suggestions.some(suggestion =>
            suggestion.name.toLowerCase() === name.toLowerCase()
        );

        if (suggestionExists) {
            alert('Cette suggestion a déjà été faite !');
            return;
        }

        // Créer la suggestion
        const suggestion = {
            id: Date.now(),
            name: name,
            category: category,
            description: description || '',
            date: new Date().toLocaleDateString('fr-FR')
        };

        this.suggestions.unshift(suggestion);
        this.saveSuggestions();
        this.displaySuggestions();

        // Réinitialiser le formulaire
        document.getElementById('suggestName').value = '';
        document.getElementById('suggestCategory').value = '';
        document.getElementById('suggestDescription').value = '';

        // Confirmation
        alert('Merci pour votre suggestion ! Elle a été ajoutée à la liste.');
    }

    displaySuggestions() {
        const container = document.getElementById('suggestionsList');

        if (this.suggestions.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center;">Aucune suggestion pour le moment.</p>';
            return;
        }

        container.innerHTML = this.suggestions.slice(0, 5).map(suggestion => `
            <div class="suggestion-item">
                <h4>${suggestion.name}</h4>
                <div class="category">Catégorie : ${suggestion.category}</div>
                ${suggestion.description ? `<div class="description">${suggestion.description}</div>` : ''}
                <div class="date">Suggéré le ${suggestion.date}</div>
            </div>
        `).join('');
    }

    loadSuggestions() {
        try {
            const saved = localStorage.getItem('food-suggestions');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
            return [];
        }
    }

    saveSuggestions() {
        try {
            localStorage.setItem('food-suggestions', JSON.stringify(this.suggestions));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des suggestions:', error);
        }
    }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new FoodApp();
});