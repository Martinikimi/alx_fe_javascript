# Dynamic Quote Generator

A comprehensive web application that demonstrates advanced DOM manipulation, web storage usage, JSON handling, content filtering, and server synchronization simulation.

## Features

### 1. **Dynamic Content Generation**
- Display random quotes from a curated collection
- Add new quotes dynamically through a form
- Delete quotes with confirmation
- Responsive design with smooth animations

### 2. **Web Storage Integration**
- **Local Storage**: Persists quotes across browser sessions
- **Session Storage**: Remembers user preferences (last filter, last viewed quote)
- Automatic data loading on page initialization
- Real-time data synchronization

### 3. **JSON Handling**
- Export all quotes to a JSON file
- Import quotes from JSON files
- Data validation and merging
- Conflict resolution for duplicate quotes

### 4. **Dynamic Content Filtering**
- Filter quotes by category
- Dynamic category extraction and population
- Remember last selected filter across sessions
- Real-time filtering updates

### 5. **Server Synchronization Simulation**
- Periodic server sync simulation
- Conflict detection and resolution
- Multiple resolution strategies:
  - Use local data
  - Use server data
  - Merge both datasets
- Last sync time tracking

## Project Structure
dom-manipulation/
├── index.html # Main HTML file with responsive design
├── script.js # Main JavaScript file with all functionality
└── README.md # This documentation file

text

## How to Use

### Basic Usage
1. Open `index.html` in any modern web browser
2. Click "Show New Quote" to display random quotes
3. Use the category filter to view quotes by specific categories

### Adding Quotes
1. Click "Add New Quote"
2. Fill in the quote text and category
3. Click "Add Quote" to save

### Data Management
1. Click "Export/Import" to access data management options
2. Export: Download all quotes as JSON file
3. Import: Upload JSON file to add new quotes
4. Clear Data: Reset to default quotes

### Server Simulation
- The app simulates server sync every 30 seconds
- Conflicts are randomly generated for demonstration
- Use the conflict resolution panel to handle conflicts

## Technical Implementation

### DOM Manipulation Techniques Used
- Dynamic element creation and insertion
- Event delegation
- CSS transitions and animations
- Responsive design with Flexbox/Grid
- Real-time DOM updates

### Web Storage Implementation
- LocalStorage for persistent data
- SessionStorage for temporary data
- JSON serialization/deserialization
- Data validation and error handling

### Conflict Resolution Strategy
1. **Detection**: Compare local and server data timestamps
2. **Notification**: Alert user about conflicts
3. **Resolution**: Provide multiple resolution options
4. **Sync**: Update both local and simulated server data

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Learning Objectives

This project demonstrates:
1. Advanced DOM manipulation without frameworks
2. Web Storage API usage (localStorage, sessionStorage)
3. JSON data handling in browser
4. Dynamic content filtering
5. Conflict resolution strategies
6. Responsive web design principles
7. Event handling and delegation
8. Modular JavaScript programming

## Notes

- All data is stored locally in the browser
- No actual server is required for basic functionality
- The server sync is simulated for learning purposes
- The application works offline once loaded

## License

This project is created for educational purposes as part of the ALX Frontend JavaScript curriculum.
