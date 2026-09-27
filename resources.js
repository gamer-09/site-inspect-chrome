document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('back-button');
  const scriptsContainer = document.getElementById('scripts-container');
  const stylesheetsContainer = document.getElementById('stylesheets-container');
  const scriptCount = document.getElementById('script-count');
  const stylesheetCount = document.getElementById('stylesheet-count');

  // Get resources from URL parameters
  function getResourcesFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const resourcesParam = urlParams.get('resources');
    if (resourcesParam) {
      try {
        return JSON.parse(decodeURIComponent(resourcesParam));
      } catch (e) {
        console.error('Error parsing resources data:', e);
      }
    }
    return { scripts: [], stylesheets: [] };
  }

  // Create a resource item element
  function createResourceItem(url) {
    const item = document.createElement('div');
    item.className = 'resource-item';
    item.textContent = url;
    item.title = 'Click to open in new tab';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(url, '_blank');
    });
    return item;
  }

  // Display resources
  function displayResources() {
    const { scripts = [], stylesheets = [] } = getResourcesFromUrl();
    
    // Update script count and list
    scriptCount.textContent = `(${scripts.length})`;
    if (scripts.length > 0) {
      const scriptsList = document.createElement('div');
      scripts.forEach(script => {
        scriptsList.appendChild(createResourceItem(script));
      });
      scriptsContainer.innerHTML = '';
      scriptsContainer.appendChild(scriptsList);
    } else {
      scriptsContainer.innerHTML = '<div class="empty-state">No scripts found</div>';
    }
    
    // Update stylesheet count and list
    stylesheetCount.textContent = `(${stylesheets.length})`;
    if (stylesheets.length > 0) {
      const stylesheetsList = document.createElement('div');
      stylesheets.forEach(stylesheet => {
        stylesheetsList.appendChild(createResourceItem(stylesheet));
      });
      stylesheetsContainer.innerHTML = '';
      stylesheetsContainer.appendChild(stylesheetsList);
    } else {
      stylesheetsContainer.innerHTML = '<div class="empty-state">No stylesheets found</div>';
    }
  }

  // Back button functionality
  backButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.close();
  });

  // Initial load
  displayResources();
});