document.addEventListener('DOMContentLoaded', function() {
  const sheetsContainer = document.getElementById('sheets-container');
  const sheetViewer = document.getElementById('sheet-viewer');
  const sheetFrame = document.getElementById('sheet-frame');
  const currentSheetTitle = document.getElementById('current-sheet');
  const backButton = document.getElementById('back-button');
  let sheets = [];

  // Get sheets data from URL parameters
  function getSheetsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const sheetsParam = urlParams.get('sheets');
    if (sheetsParam) {
      try {
        return JSON.parse(decodeURIComponent(sheetsParam));
      } catch (e) {
        console.error('Error parsing sheets data:', e);
      }
    }
    return [];
  }

  // Display sheets list
  function displaySheets() {
    sheets = getSheetsFromUrl();
    
    if (sheets.length === 0) {
      sheetsContainer.innerHTML = '<div class="empty-state">No Google Sheets found</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'sheet-list';

    sheets.forEach((sheet, index) => {
      const item = document.createElement('div');
      item.className = 'sheet-item';
      item.textContent = sheet.title || `Sheet ${index + 1}`;
      item.addEventListener('click', () => viewSheet(sheet));
      list.appendChild(item);
    });

    sheetsContainer.innerHTML = '';
    sheetsContainer.appendChild(list);
  }

  // View a specific sheet
  function viewSheet(sheet) {
    if (!sheet.url) return;
    
    // Update UI
    document.querySelectorAll('.sheet-item').forEach(item => {
      item.classList.remove('active');
      if (item.textContent === sheet.title) {
        item.classList.add('active');
      }
    });
    
    // Show the viewer and update iframe
    document.getElementById('sheets-list').style.display = 'none';
    sheetViewer.style.display = 'block';
    currentSheetTitle.textContent = sheet.title || 'Untitled Sheet';
    
    // Convert Google Sheets URL to embeddable format if needed
    let embedUrl = sheet.url;
    if (embedUrl.includes('/edit')) {
      embedUrl = embedUrl.replace('/edit', '/preview');
    } else if (!embedUrl.includes('/preview')) {
      embedUrl = embedUrl + (embedUrl.endsWith('/') ? 'preview' : '/preview');
    }
    
    sheetFrame.src = embedUrl;
  }

  // Back button functionality
  backButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.close();
  });

  // Initial load
  displaySheets();
});