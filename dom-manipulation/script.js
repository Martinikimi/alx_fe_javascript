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
    console.log('DOM loaded - initializing application');
    
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
    
    console.log('Application initialized successfully');
});

// Load quotes from local storage or initialize with default quotes
function loadQuotesFromStorage() {
    console.log('Loading quotes from storage...');
    const storedQuotes = localStorage.getItem('quotes');
    const storedServerQuotes = sessionStorage.getItem('serverQuotes');
    
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
        console.log(`Loaded ${quotes.length} quotes from local storage`);
        showNotification('Quotes loaded from local storage!', 'success');
    } else {
        quotes = [...defaultQuotes];
        saveQuotes();
        console.log(`Initialized with ${quotes.length} default quotes`);
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
    console.log('Saving quotes to storage...');
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    updateLastSyncDisplay();
    updateStats();
    console.log(`Saved ${quotes.length} quotes to local storage`);
}

// Update last sync display
function updateLastSyncDisplay() {
    const lastSyncElement = document.getElementById('lastSync');
    if (!lastSyncElement) {
        console.error('lastSync element not found');
        return;
    }
    
    if (lastSyncTime) {
        const timeDiff = Math.floor((new Date() - new Date(lastSyncTime)) / 1000);
        if (timeDiff < 60) {
            lastSyncElement.textContent = `${timeDiff}s ago`;
        } else if (timeDiff < 3600) {
            lastSyncElement.textContent = `${Math.floor(timeDiff / 60)}m ago`;
        } else {
            lastSyncElement.textContent = `${Math.floor(timeDiff / 3600)}h ago`;
        }
    } else {
        lastSyncElement.textContent = 'Never';
    }
}

// Display a random quote
function showRandomQuote() {
    console.log('Showing random quote...');
    
    if (quotes.length === 0) {
        console.warn('No quotes available to show');
        return;
    }
    
    const filtered = filteredQuotes.length > 0 && lastSelectedCategory !== 'all' 
        ? filteredQuotes 
        : quotes;
    
    if (filtered.length === 0) {
        console.warn('No quotes available in filtered list');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    
    const quoteTextElement = document.getElementById('quoteText');
    const quoteCategoryElement = document.getElementById('quoteCategory');
    
    if (!quoteTextElement || !quoteCategoryElement) {
        console.error('Quote display elements not found!');
        return;
    }
    
    quoteTextElement.textContent = `"${quote.text}"`;
    quoteCategoryElement.textContent = `Category: ${quote.category} ${quote.author ? `| By: ${quote.author}` : ''}`;
    
    console.log(`Displayed quote: ${quote.text.substring(0, 50)}...`);
    
    // Store last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    
    // Highlight the quote in the list
    highlightQuoteInList(quote.id);
}

// Add a random quote from a predefined list
function addRandomQuote() {
    console.log('Adding random quote...');
    
    const randomQuotes = [
        { text: "The journey of a thousand miles begins with one step.", category: "Journey", author: "Lao Tzu" },
        { text: "That which does not kill us makes us stronger.", category: "Strength", author: "Friedrich Nietzsche" },
        { text: "Be yourself; everyone else is already taken.", category: "Individuality", author: "Oscar Wilde" },
        { text: "We accept the love we think we deserve.", category: "Love", author: "Stephen Chbosky" },
        { text: "Without music, life would be a mistake.", category: "Music", author: "Friedrich Nietzsche" }
    ];
    
    const randomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
    randomQuote.id = Date.now(); // Generate unique ID
    randomQuote.timestamp = new Date().toISOString();
    
    quotes.push(randomQuote);
    saveQuotes();
    populateCategories();
    updateQuotesList();
    
    console.log(`Added random quote: ${randomQuote.text.substring(0, 50)}...`);
    showNotification('Random quote added successfully!', 'success');
}

// Create form to add new quote
function createAddQuoteForm() {
    console.log('Creating add quote form...');
    document.getElementById('addQuoteForm').style.display = 'block';
    document.getElementById('exportImportSection').style.display = 'none';
    document.getElementById('newQuoteText').focus();
}

// Cancel adding new quote
function cancelAddQuote() {
    console.log('Canceling add quote form...');
    document.getElementById('addQuoteForm').style.display = 'none';
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Add a new quote
function addQuote() {
    console.log('Adding new quote...');
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
    document.getElementById('addQuoteForm').style.display = 'none';
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    console.log(`Added new quote: ${newQuote.text.substring(0, 50)}...`);
    showNotification('Quote added successfully!', 'success');
    
    // Update filter if new category matches current filter
    if (lastSelectedCategory === quoteCategory || lastSelectedCategory === 'all') {
        filterQuotes();
    }
}

// Populate categories dropdown
function populateCategories() {
    console.log('Populating categories...');
    
    // Extract unique categories
    categories = [...new Set(quotes.map(quote => quote.category))];
    console.log(`Found ${categories.length} unique categories:`, categories);
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) {
        console.error('categoryFilter element not found');
        return;
    }
    
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add categories alphabetically
    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (categories.includes(currentSelection) || currentSelection === 'all') {
        categoryFilter.value = currentSelection;
        lastSelectedCategory = currentSelection;
    }
    
    console.log('Categories populated successfully');
}

// Filter quotes by category
function filterQuotes() {
    console.log('Filtering quotes...');
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) {
        console.error('categoryFilter element not found');
        return;
    }
    
    const selectedCategory = categoryFilter.value;
    lastSelectedCategory = selectedCategory;
    
    console.log(`Selected category: ${selectedCategory}`);
    
    // Save to session storage
    sessionStorage.setItem('lastFilter', selectedCategory);
    
    if (selectedCategory === 'all') {
        filteredQuotes = [];
        console.log('Showing all categories');
        showRandomQuote();
        showNotification('Showing all quotes', 'info');
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        console.log(`Found ${filteredQuotes.length} quotes in category "${selectedCategory}"`);
        
        const quoteTextElement = document.getElementById('quoteText');
        const quoteCategoryElement = document.getElementById('quoteCategory');
        
        if (!quoteTextElement || !quoteCategoryElement) {
            console.error('Quote display elements not found!');
            return;
        }
        
        if (filteredQuotes.length > 0) {
            // Show a random quote from the filtered category
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            const quote = filteredQuotes[randomIndex];
            
            quoteTextElement.textContent = `"${quote.text}"`;
            quoteCategoryElement.textContent = `Category: ${quote.category} ${quote.author ? `| By: ${quote.author}` : ''}`;
            
            console.log(`Displayed filtered quote: ${quote.text.substring(0, 50)}...`);
            
            // Highlight the quote in the list
            highlightQuoteInList(quote.id);
        } else {
            // No quotes in this category
            quoteTextElement.textContent = `No quotes found in category "${selectedCategory}"`;
            quoteCategoryElement.textContent = 'Try selecting a different category or add quotes to this category';
            console.log(`No quotes found in category "${selectedCategory}"`);
        }
        
        showNotification(`Filtered by: ${selectedCategory} (${filteredQuotes.length} quotes)`, 'info');
    }
    
    updateQuotesList();
}

// Show all quotes
function showAllQuotes() {
    console.log('Showing all quotes...');
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = 'all';
    }
    
    lastSelectedCategory = 'all';
    sessionStorage.setItem('lastFilter', 'all');
    filteredQuotes = [];
    
    updateQuotesList();
    showRandomQuote();
    
    console.log('Showing all quotes complete');
    showNotification('Showing all quotes', 'info');
}

// Update the quotes list display
function updateQuotesList() {
    console.log('Updating quotes list...');
    
    const quotesList = document.getElementById('quotesList');
    if (!quotesList) {
        console.error('quotesList element not found');
        return;
    }
    
    const displayQuotes = filteredQuotes.length > 0 && lastSelectedCategory !== 'all' 
        ? filteredQuotes 
        : quotes;
    
    console.log(`Displaying ${displayQuotes.length} quotes in list`);
    
    if (displayQuotes.length === 0) {
        quotesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No quotes available. Add some quotes to get started!</p>';
        return;
    }
    
    let html = '';
    displayQuotes.forEach((quote, index) => {
        html += `
            <div class="quote-item" data-id="${quote.id}" style="
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            ">
                <div style="font-style: italic; margin-bottom: 8px; font-size: 1.1rem;">"${quote.text}"</div>
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
    
    quotesList.innerHTML = html;
    
    // Update statistics
    updateStats();
    
    console.log('Quotes list updated successfully');
}

// Highlight a quote in the list
function highlightQuoteInList(quoteId) {
    console.log(`Highlighting quote with ID: ${quoteId}`);
    
    const quoteItems = document.querySelectorAll('.quote-item');
    quoteItems.forEach(item => {
        if (item.dataset.id == quoteId) {
            item.style.backgroundColor = '#e3f2fd';
            item.style.borderLeft = '4px solid #4CAF50';
            console.log(`Highlighted quote ID: ${quoteId}`);
        } else {
            item.style.backgroundColor = 'white';
            item.style.borderLeft = '4px solid #667eea';
        }
    });
}

// Delete a quote
function deleteQuote(id) {
    console.log(`Deleting quote with ID: ${id}`);
    
    if (!confirm('Are you sure you want to delete this quote?')) {
        return;
    }
    
    // Find the quote to get its text for logging
    const quoteToDelete = quotes.find(q => q.id === id);
    
    quotes = quotes.filter(quote => quote.id !== id);
    saveQuotes();
    populateCategories();
    
    // Update filtered quotes if needed
    if (filteredQuotes.length > 0) {
        filteredQuotes = filteredQuotes.filter(quote => quote.id !== id);
    }
    
    updateQuotesList();
    
    if (quoteToDelete) {
        console.log(`Deleted quote: ${quoteToDelete.text.substring(0, 50)}...`);
        showNotification('Quote deleted successfully!', 'success');
    }
    
    // Show new random quote
    showRandomQuote();
}

// Export quotes to JSON file
function exportToJson() {
    console.log('Exporting quotes to JSON...');
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Exported ${quotes.length} quotes to JSON`);
    showNotification('Quotes exported successfully!', 'success');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    console.log('Importing quotes from JSON file...');
    
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            console.log(`Parsed ${importedQuotes.length} quotes from file`);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid file format - expected array of quotes');
            }
            
            // Add unique IDs to imported quotes if missing
            importedQuotes.forEach(quote => {
                if (!quote.id) quote.id = Date.now() + Math.random();
                if (!quote.timestamp) quote.timestamp = new Date().toISOString();
                if (!quote.author) quote.author = 'Imported';
            });
            
            // Merge with existing quotes
            const existingIds = quotes.map(q => q.id);
            const newQuotes = importedQuotes.filter(q => !existingIds.includes(q.id));
            
            console.log(`Adding ${newQuotes.length} new quotes from import`);
            
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            updateQuotesList();
            
            showNotification(`Imported ${newQuotes.length} new quotes!`, 'success');
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error importing file:', error);
            showNotification('Error importing file: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        console.error('Error reading file');
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
}

// Show export/import options
function showExportOptions() {
    console.log('Showing export/import options...');
    document.getElementById('exportImportSection').style.display = 'block';
    document.getElementById('addQuoteForm').style.display = 'none';
}

// Clear all data from local storage
function clearLocalStorage() {
    console.log('Clearing all data...');
    
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        return;
    }
    
    localStorage.removeItem('quotes');
    localStorage.removeItem('categories');
    localStorage.removeItem('lastSyncTime');
    sessionStorage.removeItem('lastFilter');
    sessionStorage.removeItem('lastViewedQuote');
    sessionStorage.removeItem('serverQuotes');
    
    quotes = [...defaultQuotes];
    saveQuotes();
    populateCategories();
    updateQuotesList();
    showRandomQuote();
    
    console.log('All data cleared and reset to defaults');
    showNotification('All data cleared and reset to defaults!', 'info');
}

// Update statistics display
function updateStats() {
    console.log('Updating statistics...');
    
    const totalQuotesElement = document.getElementById('totalQuotes');
    const totalCategoriesElement = document.getElementById('totalCategories');
    
    if (totalQuotesElement) {
        totalQuotesElement.textContent = quotes.length;
    }
    
    if (totalCategoriesElement) {
        totalCategoriesElement.textContent = categories.length;
    }
    
    // Update storage type display
    const storageTypeElement = document.getElementById('storageType');
    if (storageTypeElement) {
        storageTypeElement.textContent = localStorage.getItem('quotes') ? 'Local Storage' : 'Default';
    }
    
    console.log(`Stats updated: ${quotes.length} quotes, ${categories.length} categories`);
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`Showing notification: ${message} (${type})`);
    
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('Notification element not found');
        return;
    }
    
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
    console.log('Starting server sync simulation...');
    
    // Simulate periodic server sync every 30 seconds
    syncInterval = setInterval(() => {
        simulateServerSync();
    }, 30000);
    
    // Initial sync after 5 seconds
    setTimeout(() => {
        simulateServerSync();
    }, 5000);
}

function simulateServerSync() {
    console.log('Simulating server sync...');
    
    // Simulate server response with some changes
    const simulatedChanges = [
        { 
            id: Date.now() + Math.random(), 
            text: "Simulated server quote 1: The server is always watching.", 
            category: "Server", 
            author: "System", 
            timestamp: new Date().toISOString() 
        },
        { 
            id: Date.now() + Math.random(), 
            text: "Simulated server quote 2: Data sync in progress.", 
            category: "Server", 
            author: "System", 
            timestamp: new Date().toISOString() 
        }
    ];
    
    // Randomly decide if there are conflicts
    if (Math.random() > 0.7) {
        console.log('Simulating conflict scenario...');
        // Simulate conflict
        serverQuotes = [...serverQuotes.slice(0, 2), ...simulatedChanges];
        sessionStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
        
        // Show conflict resolution UI
        const conflictElement = document.getElementById('conflictResolution');
        if (conflictElement) {
            conflictElement.style.display = 'block';
        }
        showNotification('Conflict detected with server data!', 'warning');
    } else {
        console.log('Simulating normal sync...');
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
    console.log('Conflict resolution: Using local data');
    
    // Server accepts local data
    const conflictElement = document.getElementById('conflictResolution');
    if (conflictElement) {
        conflictElement.style.display = 'none';
    }
    showNotification('Using local data. Server updated.', 'success');
}

function useServerData() {
    console.log('Conflict resolution: Using server data');
    
    // Use server data
    const newQuotes = serverQuotes.filter(serverQuote => 
        !quotes.some(localQuote => localQuote.id === serverQuote.id)
    );
    
    console.log(`Adding ${newQuotes.length} quotes from server`);
    
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    updateQuotesList();
    
    const conflictElement = document.getElementById('conflictResolution');
    if (conflictElement) {
        conflictElement.style.display = 'none';
    }
    showNotification('Server data applied locally.', 'success');
}

function mergeData() {
    console.log('Conflict resolution: Merging data');
    
    // Merge both datasets
    const beforeMergeCount = quotes.length;
    
    serverQuotes.forEach(serverQuote => {
        if (!quotes.some(localQuote => localQuote.id === serverQuote.id)) {
            quotes.push(serverQuote);
        }
    });
    
    const addedCount = quotes.length - beforeMergeCount;
    
    saveQuotes();
    populateCategories();
    updateQuotesList();
    
    const conflictElement = document.getElementById('conflictResolution');
    if (conflictElement) {
        conflictElement.style.display = 'none';
    }
    
    console.log(`Merged ${addedCount} new quotes from server`);
    showNotification(`Data merged successfully! Added ${addedCount} new quotes.`, 'success');
}


quoteDisplay
fetchQuotesFromServer
await", "async", "https://jsonplaceholder.typicode.com/posts
