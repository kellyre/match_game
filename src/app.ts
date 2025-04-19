interface Card {
    element: HTMLElement;
    char: string;
    color: string;
    revealed: boolean;
}

class MatchingGame {
    private gridElement: HTMLElement;
    private attemptsElement: HTMLElement;
    private timeElement: HTMLElement;
    private cards: Card[][] = [];
    private firstClick: { row: number, col: number } | null = null;
    private matchesFound: number = 0;
    private attempts: number = 0;
    private startTime: number | null = null;
    private gameActive: boolean = false;
    private timerInterval: number | null = null;
    private pendingHideTimeout: number | null = null;
    private buttonsToHide: [number, number, number, number] | null = null;
    
    private colors: string[] = ["red", "blue", "green", "purple", "orange", "cyan", "magenta", "brown"];
    
    constructor() {
        this.gridElement = document.getElementById('grid') as HTMLElement;
        this.attemptsElement = document.getElementById('attempts') as HTMLElement;
        this.timeElement = document.getElementById('time') as HTMLElement;
        
        // Set up size selection buttons
        const sizeButtons = document.querySelectorAll('.size-btn');
        sizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const size = parseInt((button as HTMLElement).dataset.size || "4");
                this.startGame(size, size);
            });
        });
        
        // Set up custom size button
        const customSizeBtn = document.getElementById('custom-size-btn');
        if (customSizeBtn) {
            customSizeBtn.addEventListener('click', () => {
                this.handleCustomSize();
            });
        }
    }
    
    private handleCustomSize(): void {
        const rowsInput = document.getElementById('rows') as HTMLInputElement;
        const colsInput = document.getElementById('cols') as HTMLInputElement;
        
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        
        // Validate inputs are numbers
        if (isNaN(rows) || isNaN(cols)) {
            alert('Please enter valid numbers for rows and columns.\n\nRules:\n- Both dimensions must be integers\n- Dimensions must be between 2 and 10\n- At least one dimension must be an even number');
            return;
        }
        
        // Validate dimensions are within allowed range
        if (rows < 2 || rows > 10 || cols < 2 || cols > 10) {
            alert('Dimensions must be between 2 and 10.\n\nRules:\n- Both dimensions must be integers\n- Dimensions must be between 2 and 10\n- At least one dimension must be an even number');
            return;
        }
        
        // Validate at least one dimension is even
        if (rows % 2 !== 0 && cols % 2 !== 0) {
            alert('At least one dimension (rows or columns) must be an even number.\n\nThis is required to ensure we can create pairs of matching cards.\n\nRules:\n- Both dimensions must be integers\n- Dimensions must be between 2 and 10\n- At least one dimension must be an even number');
            return;
        }
        
        // Start game with custom dimensions
        this.startGame(rows, cols);
    }
    
    private startGame(rows: number, cols: number): void {
        // Clear any existing game
        this.resetGame();
        
        // Set up grid CSS
        this.gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // Reset game variables
        this.cards = [];
        this.firstClick = null;
        this.matchesFound = 0;
        this.attempts = 0;
        this.attemptsElement.textContent = "0";
        this.timeElement.textContent = "00:00";
        this.gameActive = true;
        
        // Create pairs of characters with colors
        const numPairs = (rows * cols) / 2;
        const characters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
        this.shuffleArray(characters);
        const selectedChars = characters.slice(0, numPairs);
        
        // Create pairs with random colors
        const pairs: Array<[string, string]> = [];
        for (const char of selectedChars) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            pairs.push([char, color], [char, color]);
        }
        
        // Shuffle the pairs
        this.shuffleArray(pairs);
        
        // Create the grid of cards
        for (let row = 0; row < rows; row++) {
            const cardRow: Card[] = [];
            for (let col = 0; col < cols; col++) {
                const idx = row * cols + col;
                const [char, color] = pairs[idx];
                
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.dataset.row = row.toString();
                cardElement.dataset.col = col.toString();
                cardElement.addEventListener('click', () => this.onCardClick(row, col));
                
                this.gridElement.appendChild(cardElement);
                
                cardRow.push({
                    element: cardElement,
                    char: char,
                    color: color,
                    revealed: false
                });
            }
            this.cards.push(cardRow);
        }
        
        // Start the timer
        this.startTimer();
    }
    
    private onCardClick(row: number, col: number): void {
        // Start timer on first click of the game
        if (!this.startTime && this.gameActive) {
            this.startTime = Date.now();
        }
        
        // Ignore clicks on already revealed cards
        if (this.cards[row][col].revealed) {
            return;
        }
        
        // If there's a pending hide operation and user clicks a new card
        if (!this.gameActive && this.pendingHideTimeout !== null) {
            // Cancel the scheduled hide operation
            window.clearTimeout(this.pendingHideTimeout);
            this.pendingHideTimeout = null;
            
            // Hide the previously non-matching cards
            if (this.buttonsToHide) {
                const [row1, col1, row2, col2] = this.buttonsToHide;
                this.hideCards(row1, col1, row2, col2);
            }
            
            // Reset first click to null so this new click becomes the first of a new pair
            this.firstClick = null;
            this.gameActive = true;
        }
        
        // Ignore clicks when game is not active (other scenarios)
        if (!this.gameActive) {
            return;
        }
        
        // Reveal the clicked card
        const card = this.cards[row][col];
        this.revealCard(card);
        
        // If this is the first card clicked
        if (this.firstClick === null) {
            this.firstClick = { row, col };
        } else {
            // Check if the user clicked the same card twice
            if (this.firstClick.row === row && this.firstClick.col === col) {
                return; // Ignore the click on the same card
            }
            
            // This is the second card clicked
            this.attempts++;
            this.attemptsElement.textContent = this.attempts.toString();
            
            const firstCard = this.cards[this.firstClick.row][this.firstClick.col];
            
            // Check if the two cards match
            if (card.char === firstCard.char && card.color === firstCard.color) {
                // Match found - ensure both cards are marked as revealed
                card.revealed = true;
                firstCard.revealed = true;
                
                // Ensure both cards are visually revealed
                this.revealCard(card);
                this.revealCard(firstCard);
                
                this.matchesFound++;
                
                // Check if all matches are found
                if (this.matchesFound === (this.cards.length * this.cards[0].length) / 2) {
                    this.gameActive = false;
                    this.showGameOver();
                }
            } else {
                // No match, hide after delay
                this.gameActive = false;
                // Store the current values before resetting firstClick
                const firstClickRow = this.firstClick.row;
                const firstClickCol = this.firstClick.col;
                this.buttonsToHide = [row, col, firstClickRow, firstClickCol];
                this.pendingHideTimeout = window.setTimeout(
                    () => this.hideCards(row, col, firstClickRow, firstClickCol),
                    2000
                );
            }
            
            // Reset first click
            this.firstClick = null;
        }
    }
    
    private hideCards(row1: number, col1: number, row2: number, col2: number): void {
        // Hide the two non-matching cards
        this.cards[row1][col1].element.textContent = '';
        this.cards[row1][col1].element.style.backgroundColor = '#f0f0f0';
        
        this.cards[row2][col2].element.textContent = '';
        this.cards[row2][col2].element.style.backgroundColor = '#f0f0f0';
        
        this.gameActive = true;
        this.pendingHideTimeout = null;
    }
    
    private showGameOver(): void {
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const elapsedTime = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        setTimeout(() => {
            alert(`Congratulations!\n\nYou completed the game in ${minutes}m ${seconds}s\nNumber of attempts: ${this.attempts}`);
            this.resetGame();
        }, 500);
    }
    
    private startTimer(): void {
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
        }
        
        this.startTime = null;
        
        this.timerInterval = window.setInterval(() => {
            if (this.startTime) {
                const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsedTime / 60);
                const seconds = elapsedTime % 60;
                this.timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    private resetGame(): void {
        // Clear the grid
        this.gridElement.innerHTML = '';
        
        // Clear any existing timers
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.pendingHideTimeout !== null) {
            window.clearTimeout(this.pendingHideTimeout);
            this.pendingHideTimeout = null;
        }
    }
    
    private shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Helper method to ensure a card is visually revealed
    private revealCard(card: Card): void {
        card.element.textContent = card.char;
        card.element.style.color = card.color;
        card.element.style.backgroundColor = 'white';
    }

    // Add a method to refresh the UI state based on the data model
    private refreshCardStates(): void {
        for (let row = 0; row < this.cards.length; row++) {
            for (let col = 0; col < this.cards[row].length; col++) {
                const card = this.cards[row][col];
                if (card.revealed) {
                    this.revealCard(card);
                } else {
                    card.element.textContent = '';
                    card.element.style.backgroundColor = '#f0f0f0';
                }
            }
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MatchingGame();
});




