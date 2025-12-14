// Global variables
let quotes = [];
let categories = [];
let filteredQuotes = [];
let lastSelectedCategory = 'all';
let syncInterval;
let serverQuotes = [];
let lastSyncTime = null;

// Quote data structure
const defaultQuotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Motivation", author: "Steve Jobs" },
    { id: 2, text: "Life is what happens to you while you're busy making other plans.", category: "Life", author: "John Lennon" },
    { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration", author: "Eleanor Roosevelt" },
    { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Hope", author: "Aristotle" },
    { id: 5, text: "Whoever is happy will make others happy too.", category: "Happiness", author: "Anne Frank" },
    { id: 6, text: "You must be the change you wish to see in the world.", category: "Change", author: "Mahatma Gandhi" },
    { id: 7, text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", category: "Love", author: "Mother Teresa" }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadQuotesFromStorage();
    showRandomQuote();
    populateCategories();
    updateQuotesList();
    updateStats();
    startSyncSimulation();
    
    // Event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('addRandomQuote').addEventListener('click', addRandomQuote);
    
    // Load last selected filter from session storage
    const lastFilter = sessionStorage.getItem('lastFilter');
    if (lastFilter) {
        document.getElementById('categoryFilter').value = lastFilter;
        filterQuotes();
    }
});

// Load quotes from local storage or initialize with default quotes
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    const storedServerQuotes = sessionStorage.getItem('serverQuotes');
    
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
        showNotification('Quotes loaded from local storage!', 'success');
    } else {
        quotes = [...defaultQuotes];
        saveQuotes();
        showNotification('Initialized with default quotes!', 'info');
    }
    
    if (storedServerQuotes) {
        serverQuotes = JSON.parse(storedServerQuotes);
    } else {
        serverQuotes = [...defaultQuotes.slice(0, 3)];
    }
    
    // Load last sync time
    lastSyncTime = localStorage.getItem('lastSyncTime');
    updateLastSyncDisplay();
    
    // Update storage type display
    document.getElementById('storageType').textContent = storedQuotes ? 'Local Storage' : 'Default';
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    updateLastSyncDisplay();
    updateStats();
}

// Update last sync display
function updateLastSyncDisplay() {
    const lastSyncElement = document.getElementById('lastSync');
    if (lastSyncTime) {
        const timeDiff = Math.floor((new Date() - new Date(lastSyncTime)) / 1000);
        if (timeDiff < 60) {
            lastSyncElement.textContent = `${timeDiff}s ago`;
        } else if (timeDiff < 3600) {
            lastSyncElement.textContent = `${Math.floor(timeDiff / 60)}m ago`;
        } else {
            lastSyncElement.textContent = `${Math.floor(timeDiff / 3600)}h ago`;
        }
    }
}

// Display a random quote
function showRandomQuote() {
    if (quotes.length === 0) return;
    
    const filtered = filteredQuotes.length > 0 && lastSelectedCategory !== 'all' 
        ? filteredQuotes 
        : quotes;
    
    if (filtered.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    
    document.getElementById('quoteText').textContent = `"${quote.text}"`;
    document.getElementById('quoteCategory').textContent = `Category: ${quote.category} ${quote.author ? `| By: ${quote.author}` : ''}`;
    
    // Store last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    
    // Highlight the quote in the list
    highlightQuoteInList(quote.id);
}

// Add a random quote from a predefined list
function addRandomQuote() {
    const randomQuotes = [
        { text: "The journey of a thousand miles begins with one step.", category: "Journey", author: "Lao Tzu" },
        { text: "That which does not kill us makes us stronger.", category: "Strength", author: "Friedrich Nietzsche" },
        { text: "Be yourself; everyone else is already taken.", category: "Individuality", author: "Oscar Wilde" },
        { text: "We accept the love we think we deserve.", category: "Love", author: "Stephen Chbosky" },
        { text: "Without music, life would be a mistake.", category: "Music", author: "Friedrich Nietzsche" }
    ];
    
    const randomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
    randomQuote.id = Date.now(); // Generate unique ID
    
    quotes.push(randomQuote);
    saveQuotes();
    populateCategories();
    updateQuotesList();
    showNotification('Random quote added successfully!', 'success');
}

// Create form to add new quote
function createAddQuoteForm() {
    document.getElementById('addQuoteForm').style.display = 'block';
    document.getElementById('exportImportSection').style.display = 'none';
    document.getElementById('newQuoteText').focus();
}

// Cancel adding new quote
function cancelAddQuote() {
    document.getElementById('addQuoteForm').style.display = 'none';
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (!quoteText || !quoteCategory) {
        showNotification('Please fill in both fields!', 'error');
        return;
    }
    
    const newQuote = {
        id: Date.now(),
        text: quoteText,
        category: quoteCategory,
        author: 'User Added',
        timestamp: new Date().toISOString()
    };
    
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    updateQuotesList();
    
    // Reset form
    document.getElementById('newQuoteForm').style.display = 'none';
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    showNotification('Quote added successfully!', 'success');
    
    // Update filter if new category matches current filter
    if (lastSelectedCategory === quoteCategory || lastSelectedCategory === 'all') {
        filterQuotes();
    }
}

// Populate categories dropdown
function populateCategories() {
    categories = [...new Set(quotes.map(quote => quote.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (categories.includes(currentSelection) || currentSelection === 'all') {
        categoryFilter.value = currentSelection;
    }
}

// Filter quotes by category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    lastSelectedCategory = selectedCategory;
    
    // Save to session storage
    sessionStorage.setItem('lastFilter', selectedCategory);
    
    if (selectedCategory === 'all') {
        filteredQuotes = [];
        document.getElementById('quoteText').textContent = 'Showing all categories';
        document.getElementById('quoteCategory').textContent = '';
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        document.getElementById('quoteText').textContent = `Showing ${filteredQuotes.length} quotes in "${selectedCategory}"`;
        document.getElementById('quoteCategory').textContent = '';
    }
    
    updateQuotesList();
    showNotification(`Filtered by: ${selectedCategory}`, 'info');
}

// Show all quotes
function showAllQuotes() {
    document.getElementById('categoryFilter').value = 'all';
    filteredQuotes = [];
    updateQuotesList();
    showNotification('Showing all quotes', 'info');
}

// Update the quotes list display
function updateQuotesList() {
    const quotesList = document.getElementById('quotesList');
    const displayQuotes = filteredQuotes.length > 0 && lastSelectedCategory !== 'all' 
        ? filteredQuotes 
        : quotes;
    
    if (displayQuotes.length === 0) {
        quotesList.innerHTML = '<p style="text-align: center; color: #666;">No quotes available. Add some quotes to get started!</p>';
        return;
    }
    
    let html = '<div class="quotes-grid">';
    displayQuotes.forEach(quote => {
        html += `
            <div class="quote-item" data-id="${quote.id}" style="
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            ">
                <div style="font-style: italic; margin-bottom: 8px;">"${quote.text}"</div>
                <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9rem;">
                    <span><strong>Category:</strong> ${quote.category}</span>
                    <span><strong>Author:</strong> ${quote.author || 'Unknown'}</span>
                </div>
                <button onclick="deleteQuote(${quote.id})" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-top: 10px;
                    font-size: 0.8rem;
                ">Delete</button>
            </div>
        `;
    });
    html += '</div>';
    
    quotesList.innerHTML = html;
}

// Highlight a quote in the list
function highlightQuoteInList(quoteId) {
    document.querySelectorAll('.quote-item').forEach(item => {
        item.style.backgroundColor = item.dataset.id == quoteId ? '#e3f2fd' : 'white';
    });
}

// Delete a quote
function deleteQuote(id) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes = quotes.filter(quote => quote.id !== id);
        saveQuotes();
        populateCategories();
        updateQuotesList();
        
        // Update filtered quotes if needed
        if (filteredQuotes.length > 0) {
            filteredQuotes = filteredQuotes.filter(quote => quote.id !== id);
        }
        
        showNotification('Quote deleted successfully!', 'success');
        
        // Show new random quote
        showRandomQuote();
    }
}

// Export quotes to JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Quotes exported successfully!', 'success');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid file format');
            }
            
            // Add unique IDs to imported quotes if missing
            importedQuotes.forEach(quote => {
                if (!quote.id) quote.id = Date.now() + Math.random();
                if (!quote.timestamp) quote.timestamp = new Date().toISOString();
            });
            
            // Merge with existing quotes
            const existingIds = quotes.map(q => q.id);
            const newQuotes = importedQuotes.filter(q => !existingIds.includes(q.id));
            
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            updateQuotesList();
            
            showNotification(`Imported ${newQuotes.length} new quotes!`, 'success');
            
            // Reset file input
            event.target.value = '';
        } catch (error) {
            showNotification('Error importing file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Show export/import options
function showExportOptions() {
    document.getElementById('exportImportSection').style.display = 'block';
    document.getElementById('addQuoteForm').style.display = 'none';
}

// Clear all data from local storage
function clearLocalStorage() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('quotes');
        localStorage.removeItem('categories');
        sessionStorage.removeItem('lastFilter');
        
        quotes = [...defaultQuotes];
        saveQuotes();
        populateCategories();
        updateQuotesList();
        showRandomQuote();
        
        showNotification('All data cleared and reset to defaults!', 'info');
    }
}

// Update statistics display
function updateStats() {
    document.getElementById('totalQuotes').textContent = quotes.length;
    document.getElementById('totalCategories').textContent = categories.length;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = type === 'error' ? '#f44336' : 
                                       type === 'success' ? '#4CAF50' : 
                                       type === 'warning' ? '#ff9800' : '#2196F3';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Server simulation functions
function startSyncSimulation() {
    // Simulate periodic server sync every 30 seconds
    syncInterval = setInterval(() => {
        simulateServerSync();
    }, 30000);
}

function simulateServerSync() {
    // Simulate server response with some changes
    const simulatedChanges = [
        { id: Date.now() + 1, text: "Simulated server quote 1", category: "Server", author: "System", timestamp: new Date().toISOString() },
        { id: Date.now() + 2, text: "Simulated server quote 2", category: "Server", author: "System", timestamp: new Date().toISOString() }
    ];
    
    // Randomly decide if there are conflicts
    if (Math.random() > 0.7) {
        // Simulate conflict
        serverQuotes = [...serverQuotes.slice(0, 2), ...simulatedChanges];
        sessionStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
        
        // Show conflict resolution UI
        document.getElementById('conflictResolution').style.display = 'block';
        showNotification('Conflict detected with server data!', 'warning');
    } else {
        // Normal sync
        serverQuotes = [...serverQuotes, ...simulatedChanges.slice(0, 1)];
        sessionStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
        
        // Update last sync time
        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        updateLastSyncDisplay();
        
        showNotification('Synced with server successfully!', 'success');
    }
}

// Conflict resolution functions
function useLocalData() {
    // Server accepts local data
    document.getElementById('conflictResolution').style.display = 'none';
    showNotification('Using local data. Server updated.', 'success');
}

function useServerData() {
    // Use server data
    const newQuotes = serverQuotes.filter(serverQuote => 
        !quotes.some(localQuote => localQuote.id === serverQuote.id)
    );
    
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    updateQuotesList();
    
    document.getElementById('conflictResolution').style.display = 'none';
    showNotification('Server data applied locally.', 'success');
}

function mergeData() {
    // Merge both datasets
    serverQuotes.forEach(serverQuote => {
        if (!quotes.some(localQuote => localQuote.id === serverQuote.id)) {
            quotes.push(serverQuote);
        }
    });
    
    saveQuotes();
    populateCategories();
    updateQuotesList();
    
    document.getElementById('conflictResolution').style.display = 'none';
    showNotification('Data merged successfully!', 'success');
}
