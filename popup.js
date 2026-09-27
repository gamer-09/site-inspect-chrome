document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const urlElement = document.getElementById('url');
  const toggleUrlBtn = document.getElementById('toggle-url');
  const refreshButton = document.getElementById('refresh');
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  const captionText = document.getElementById('caption');
  const closeBtn = document.querySelector('.close');
  const header = document.querySelector('.header');
  let isUrlExpanded = false;
  
  // Error display function
  function showError(message) {
    console.error(message);
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = 'background: #f8d7da; color: #721c24; padding: 12px; border-radius: 4px; margin-bottom: 12px; font-size: 12px;';
    header.parentNode.insertBefore(errorEl, header.nextSibling);
    setTimeout(() => errorEl.remove(), 5000);
  }
  
  // Validate required elements
  if (!urlElement || !toggleUrlBtn || !refreshButton || !modal || !modalImg || !captionText || !closeBtn || !header) {
    showError('Required DOM elements not found');
    return;
  }

  // Function to toggle URL display
  function toggleUrlDisplay() {
    isUrlExpanded = !isUrlExpanded;
    urlElement.classList.toggle('expanded', isUrlExpanded);
    toggleUrlBtn.textContent = isUrlExpanded ? '↕' : '↔';
    toggleUrlBtn.title = isUrlExpanded ? 'Collapse URL' : 'Expand URL';
    try { toggleUrlBtn.setAttribute('aria-pressed', isUrlExpanded ? 'true' : 'false'); } catch {}
    
    if (!isUrlExpanded) {
      urlElement.title = urlElement.textContent;
    } else {
      urlElement.removeAttribute('title');
    }
  }

  // Hook up the URL toggle button
  if (toggleUrlBtn) {
    toggleUrlBtn.addEventListener('click', (e) => { e.preventDefault(); toggleUrlDisplay(); });
    toggleUrlBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleUrlDisplay(); }
    });
  }

  // Refresh button setup
  if (refreshButton) {
    refreshButton.addEventListener('click', updatePopupInfo);
  }

  // Toggle section visibility
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const container = document.getElementById(targetId);
      const toggleBtn = this.querySelector('.toggle-btn');
      const isCollapsing = !container.classList.contains('collapsed');
      
      container.classList.toggle('collapsed');
      toggleBtn.classList.toggle('collapsed');
      
      // Toggle the arrow icon
      if (toggleBtn.textContent === '▼') {
        toggleBtn.textContent = '▶';
      } else {
        toggleBtn.textContent = '▼';
      }
      
      // Toggle view all resources button visibility
      if (targetId === 'resources-container') {
        const viewAllResources = document.getElementById('view-all-resources');
        if (viewAllResources) {
          viewAllResources.style.display = isCollapsing ? 'none' : 'block';
        }
      }
    });
  });

  // Function to escape HTML to prevent XSS
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Function to update page details in the UI
  function updatePageDetails(pageInfo) {
    if (!pageInfo) return;

    // Update basic info
    if (pageInfo.loadTime) {
      document.getElementById('load-time').textContent = 
        typeof pageInfo.loadTime === 'number' ? 
        `${Math.round(pageInfo.loadTime)}ms` : 
        pageInfo.loadTime;
    }
    
    if (pageInfo.scripts !== undefined) {
      document.getElementById('scripts-count').textContent = pageInfo.scripts;
    }
    
    if (pageInfo.stylesheets !== undefined) {
      document.getElementById('stylesheets-count').textContent = pageInfo.stylesheets;
    }
    
    if (pageInfo.pageSize) {
      if (pageInfo.pageSize.domNodes !== undefined) {
        document.getElementById('dom-nodes').textContent = 
          pageInfo.pageSize.domNodes.toLocaleString();
      }
      
      if (pageInfo.pageSize.textLength !== undefined) {
        const textKB = Math.round(pageInfo.pageSize.textLength / 1024 * 100) / 100;
        document.getElementById('text-length').textContent = `${textKB} KB`;
      }
    }
    
    // Update security info
    const securityEl = document.getElementById('security');
    if (pageInfo.security) {
      if (pageInfo.security.isSecure) {
        securityEl.textContent = '🔒 Secure';
        securityEl.className = 'secure';
      } else {
        securityEl.textContent = '⚠️ Not Secure';
        securityEl.className = 'insecure';
      }
      
      if (pageInfo.security.hasMixedContent) {
        securityEl.textContent += ' (Mixed Content)';
        securityEl.title = 'This page contains insecure (HTTP) resources';
      }
    }

    // Update meta tags
    const metaTagsList = document.getElementById('meta-tags-list');
    metaTagsList.innerHTML = '';
    
    if (pageInfo.metaTags && pageInfo.metaTags.length > 0) {
      pageInfo.metaTags.forEach(tag => {
        if (tag.name && tag.content) {
          const tagEl = document.createElement('div');
          tagEl.className = 'meta-tag';
          tagEl.innerHTML = `
            <span class="name">${escapeHtml(tag.name)}</span>
            <span class="content">${escapeHtml(tag.content)}</span>
          `;
          metaTagsList.appendChild(tagEl);
        }
      });
    } else {
      metaTagsList.innerHTML = '<div class="empty-state">No meta tags found</div>';
    }
  }

  // Function to update the resources section
  function updateResourcesSection(resources) {
    const { scripts = [], stylesheets = [] } = resources;
    const resourcesContainer = document.getElementById('resources-container');
    const resourcesCount = document.getElementById('resources-count');
    const viewAllResources = document.getElementById('view-all-resources');
    const viewResourcesLink = document.getElementById('view-resources-link');
    
    const totalResources = scripts.length + stylesheets.length;
    resourcesCount.textContent = `(${totalResources})`;
    
    if (totalResources > 0) {
      let resourcesHTML = '';
      
      // Add scripts
      if (scripts.length > 0) {
        resourcesHTML += '<div class="resource-header">Scripts:</div>';
        scripts.slice(0, 2).forEach(script => {
          resourcesHTML += `<div class="resource-item" data-url="${script}">${script}</div>`;
        });
        if (scripts.length > 2) {
          resourcesHTML += `<div class="more-items">...and ${scripts.length - 2} more scripts</div>`;
        }
      }
      
      // Add stylesheets
      if (stylesheets.length > 0) {
        resourcesHTML += '<div class="resource-header">Stylesheets:</div>';
        stylesheets.slice(0, 2).forEach(stylesheet => {
          resourcesHTML += `<div class="resource-item" data-url="${stylesheet}">${stylesheet}</div>`;
        });
        if (stylesheets.length > 2) {
          resourcesHTML += `<div class="more-items">...and ${stylesheets.length - 2} more stylesheets</div>`;
        }
      }
      
      resourcesContainer.innerHTML = resourcesHTML;
      
      // Add click handlers for resource items
      document.querySelectorAll('.resource-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const url = e.target.getAttribute('data-url');
          if (url) {
            window.open(url, '_blank');
          }
        });
      });
      
      // Show view all button if there are more than 2 of either type
      if (scripts.length > 2 || stylesheets.length > 2) {
        viewAllResources.style.display = 'block';
        viewResourcesLink.onclick = (e) => {
          e.preventDefault();
          const resourcesUrl = `resources.html?resources=${encodeURIComponent(JSON.stringify(resources))}`;
          chrome.tabs.create({ url: chrome.runtime.getURL(resourcesUrl) });
        };
      } else {
        viewAllResources.style.display = 'none';
      }
    } else {
      resourcesContainer.innerHTML = '<div class="empty-state">No resources found on this page</div>';
      viewAllResources.style.display = 'none';
    }
  }

  // Update the links list
  function updateLinksList(links) {
    const linksContainer = document.getElementById('links-container');
    const linkCount = document.getElementById('link-count');
    
    if (links && links.length > 0) {
      const linksList = document.createElement('div');
      linksList.className = 'links-list';
      
      // Show all links without any limit
      links.forEach(link => {
        const linkEl = document.createElement('div');
        linkEl.className = 'link-item';
        linkEl.innerHTML = `
          <a href="${escapeHtml(link.href)}" target="_blank" class="link-url" title="${escapeHtml(link.href)}">
            ${escapeHtml(link.text || link.href)}
          </a>
        `;
        linksList.appendChild(linkEl);
      });
      
      linksContainer.innerHTML = '';
      linksContainer.appendChild(linksList);
      linkCount.textContent = `(${links.length})`;
    } else {
      linksContainer.innerHTML = '<div class="empty-state">No links found</div>';
      linkCount.textContent = '(0)';
    }
  }

  // Update the images list with all images displayed
  function updateImagesList(images) {
    const imagesContainer = document.getElementById('images-container');
    const imageCount = document.getElementById('image-count');
    
    if (images && images.length > 0) {
      imagesContainer.innerHTML = ''; // Clear existing content
      
      // Create a container for the images
      const imagesGrid = document.createElement('div');
      imagesGrid.className = 'images-grid';
      
      // Track loaded and failed images
      const loadedImages = new Set();
      const failedImages = new Set();
      const maxRetries = 3;
      
      // Helper function to handle image loading errors
      const handleImageError = (imgEl, src, retryCount, resolve) => {
        if (retryCount < maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 30000);
          console.log(`Retrying image ${src} (attempt ${retryCount + 1}/${maxRetries}) in ${Math.round(delay)}ms`);
          
          setTimeout(() => {
            loadImageWithRetry(imgEl, src, retryCount + 1);
          }, delay);
        } else {
          // All retries failed
          console.warn(`Failed to load image after ${maxRetries} attempts:`, src);
          failedImages.add(src);
          imgEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#999">Failed to load</text></svg>';
          imgEl.style.opacity = '0.7';
          imgEl.style.cursor = 'not-allowed';
        
        imgEl.title = `Failed to load: ${src}`;
          resolve(false);
        }
      };
      
      // Function to handle image loading with retries and better CORS handling
      const loadImageWithRetry = (imgEl, src, retryCount = 0) => {
        return new Promise((resolve) => {
          // Check if this is a data URI (these should always work)
          if (src.startsWith('data:image/')) {
            imgEl.src = src;
            imgEl.style.opacity = '1';
            loadedImages.add(src);
            resolve(true);
            return;
          }

          const tempImg = new Image();
          
          // Create a timeout to handle unresponsive images (10 seconds)
          const timeout = setTimeout(() => {
            tempImg.onload = null;
            tempImg.onerror = null;
            handleImageError(imgEl, src, retryCount, resolve);
          }, 10000);
          
          tempImg.onload = () => {
            clearTimeout(timeout);
            // Only update if the image loaded successfully
            if (tempImg.width > 0 && tempImg.height > 0) {
              console.log(`Successfully loaded image: ${src}`);
              imgEl.src = src;
              imgEl.style.opacity = '1';
              loadedImages.add(src);
              failedImages.delete(src);
              resolve(true);
            } else {
              console.warn(`Image loaded but has invalid dimensions: ${src}`);
              handleImageError(imgEl, src, retryCount, resolve);
            }
          };
          
          tempImg.onerror = (e) => {
            clearTimeout(timeout);
            console.error(`Error loading image: ${src}`, e);
            
            // Check if this is a CORS error
            if (e.toString().includes('CORS') || e.toString().includes('cross-origin')) {
              console.warn(`CORS error for image: ${src}, trying proxy approach`);
              // Try using a proxy or different approach for CORS issues
              tryProxyImage(imgEl, src, retryCount, resolve);
            } else {
              handleImageError(imgEl, src, retryCount, resolve);
            }
          };
          
          // Try to load the image with progressive CORS handling
          try {
            if (src.startsWith('blob:')) {
              // Skip blob URLs as they're often problematic
              handleImageError(imgEl, src, 0, resolve);
              return;
            }
            
            // First try with absolute URL and anonymous CORS
            const absoluteSrc = new URL(src, window.location.href).href;
            tempImg.crossOrigin = 'anonymous';
            tempImg.src = absoluteSrc;
            
          } catch (e) {
            console.warn(`Error processing image URL (${src}):`, e);
            handleImageError(imgEl, src, 0, resolve);
          }
        });
      };

      // Try alternative approaches for blocked images
      const tryProxyImage = (imgEl, src, retryCount, resolve) => {
        // For now, we'll just show a placeholder with the original URL
        // In a production extension, you might use a CORS proxy service
        console.log(`Image blocked by CORS: ${src}`);
        
        // Create a placeholder that shows the image URL
        const placeholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50%" y="40%" font-family="Arial" font-size="8" text-anchor="middle" dominant-baseline="middle" fill="#666">CORS Blocked</text><text x="50%" y="60%" font-family="Arial" font-size="6" text-anchor="middle" dominant-baseline="middle" fill="#999">Image unavailable</text></svg>`;
        
        imgEl.src = placeholder;
        imgEl.style.opacity = '0.7';
        imgEl.style.cursor = 'not-allowed';
        imgEl.title = 'CORS Blocked: ' + src;
        resolve(false);
      };
      
      // Display all images
      images.forEach((img, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
        const loader = document.createElement('div');
        loader.className = 'image-loader';
        loader.textContent = 'Loading...';
        
        const imgEl = document.createElement('img');
        imgEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#ccc">Loading...</text></svg>';
        imgEl.alt = img.alt || `Image ${index + 1}`;
        imgEl.loading = 'lazy';
        imgEl.style.maxWidth = '100%';
        imgEl.style.height = 'auto';
        imgEl.style.objectFit = 'contain';
        imgEl.style.maxHeight = '150px';
        imgEl.style.opacity = '0';
        imgEl.style.transition = 'opacity 0.3s ease';
        
        // Create download overlay
        const downloadOverlay = document.createElement('div');
        downloadOverlay.className = 'download-overlay';
        
        // Create download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i>⬇️</i> Download';
        downloadBtn.onclick = (e) => {
          e.stopPropagation();
          // Create a temporary link to trigger download
          const link = document.createElement('a');
          link.href = img.src;
          // Extract filename from URL or use a default name
          const filename = img.src.split('/').pop().split('?')[0] || 'image.png';
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        
        downloadOverlay.appendChild(downloadBtn);
        
        const imgInfo = document.createElement('div');
        imgInfo.className = 'image-info';
        imgInfo.textContent = img.width && img.height ? `${img.width}×${img.height}` : 'Loading...';
        imgInfo.style.fontSize = '11px';
        imgInfo.style.color = '#666';
        
        // Add status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';
        statusIndicator.style.width = '10px';
        statusIndicator.style.height = '10px';
        statusIndicator.style.borderRadius = '50%';
        statusIndicator.style.backgroundColor = '#ccc';
        statusIndicator.style.display = 'inline-block';
        statusIndicator.style.marginRight = '5px';
        statusIndicator.title = 'Loading...';
        
        imgInfo.prepend(statusIndicator);
        
        imgContainer.appendChild(loader);
        imgContainer.appendChild(imgEl);
        imgContainer.appendChild(downloadOverlay);
        imgContainer.appendChild(imgInfo);
        
        imgContainer.addEventListener('click', (event) => {
          // Don't open modal if clicking on download button
          if (event.target === downloadBtn || event.target.closest('.download-btn')) {
            return;
          }
          if (loadedImages.has(img.src)) {
            modal.style.display = 'flex';
            modalImg.src = img.src;
            captionText.textContent = img.alt || '';
          }
        });
        
        // Load image with retries
        loadImageWithRetry(imgEl, img.src).then((success) => {
          if (success) {
            // Update status indicator
            statusIndicator.style.backgroundColor = '#4CAF50';
            statusIndicator.title = 'Loaded successfully';
            loader.style.display = 'none';
            
            // Update image info with actual dimensions
            imgEl.onload = function() {
              imgInfo.textContent = `${this.naturalWidth}×${this.naturalHeight}`;
              imgInfo.prepend(statusIndicator);
            };
          } else {
            // Update status indicator for failed load
            statusIndicator.style.backgroundColor = '#f44336';
            statusIndicator.title = 'Failed to load';
            loader.textContent = 'Failed to load';
            loader.style.color = '#f44336';
          }
        });
        
        imagesGrid.appendChild(imgContainer);
      });
      
      imagesContainer.appendChild(imagesGrid);
      imageCount.textContent = `(${images.length})`;
    } else {
      imagesContainer.innerHTML = '<div class="empty-state">No images found</div>';
      imageCount.textContent = '(0)';
    }
  }

  // Close modal when clicking the close button
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };

  // Close modal when clicking outside the image
  modal.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Close modal with Escape key
  if (modal) {
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }

  // Main function to update popup info
  async function updatePopupInfo() {
    // Update URL display
    if (urlElement) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if tab URL is accessible
        if (tab && tab.url && !tab.url.startsWith('chrome://')) {
          urlElement.textContent = tab.url;
          urlElement.title = tab.url;
          
          if (isUrlExpanded) {
            toggleUrlDisplay();
          }
        } else {
          urlElement.textContent = 'Restricted URL (chrome://)';
          urlElement.title = 'Cannot access chrome:// URLs';
          showError('Cannot inspect chrome:// pages - they are restricted for security reasons');
          return;
        }
      } catch (error) {
        console.error('Error getting tab info:', error);
        urlElement.textContent = 'Error accessing tab';
        showError('Error accessing tab information');
        return;
      }
    }
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('No active tab found');
      }

      // Check if we can access this tab
      if (tab.url.startsWith('chrome://')) {
        throw new Error('Cannot access chrome:// URLs for security reasons');
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Get all links
          const links = Array.from(document.links).map(link => ({
            href: link.href,
            text: link.innerText || link.getAttribute('aria-label') || link.title || link.href
          }));

          // Function to check if image can be accessed
          const canAccessImage = (src) => {
            if (!src) return false;
            // Skip chrome:// URLs, data URLs that might be too large, and blob URLs
            if (src.startsWith('chrome://') || src.startsWith('blob:')) return false;
            // Check for common image formats
            return /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(src) || src.startsWith('data:image/');
          };

          // Get all images with filtering
          const images = Array.from(document.images)
            .filter(img => canAccessImage(img.src))
            .map(img => ({
              src: img.src,
              alt: img.alt || '',
              title: img.title || img.alt || 'Image',
              width: img.naturalWidth,
              height: img.naturalHeight,
              // Add additional info for better error handling
              loading: img.loading || 'eager',
              crossOrigin: img.crossOrigin || null
            }));

          // Collect page information
          const pageInfo = {
            loadTime: performance.timing ? 
              (performance.timing.loadEventEnd - performance.timing.navigationStart) : null,
            scripts: document.scripts.length,
            stylesheets: document.styleSheets.length,
            metaTags: Array.from(document.getElementsByTagName('meta'))
              .filter(meta => meta.name || meta.property || meta.httpEquiv)
              .map(meta => ({
                name: meta.name || meta.property || meta.httpEquiv || '',
                content: meta.content || ''
              })),
            security: {
              isSecure: window.location.protocol === 'https:',
              hasMixedContent: document.querySelector('img[src^="http://"], script[src^="http://"], link[href^="http://"]') !== null
            },
            pageSize: {
              domNodes: document.getElementsByTagName('*').length,
              textLength: document.body ? document.body.innerText.length : 0
            }
          };

          return {
            url: window.location.href,
            title: document.title,
            links,
            images,
            pageInfo,
            resources: {
              scripts: Array.from(document.scripts)
                .map(script => script.src)
                .filter(src => src && !src.startsWith('chrome-extension://')),
              stylesheets: Array.from(document.styleSheets)
                .map(sheet => sheet.href)
                .filter(href => href && !href.startsWith('chrome-extension://'))
            }
          };
        }
      });

      if (results && results[0] && results[0].result) {
        const { url, title, links = [], images = [], pageInfo = {}, resources = {} } = results[0].result;
        
        // Update URL and title
        document.getElementById('url').textContent = url;
        document.getElementById('title').textContent = title;
        
        // Update resources section
        updateResourcesSection(resources);
        
        // Update links and images
        updateLinksList(links);
        updateImagesList(images);
        
        // Update page details
        updatePageDetails(pageInfo);
      }
    } catch (error) {
      console.error('Error updating popup:', error);
      let errorMessage = 'Error loading page data: ' + error.message;
      
      // Provide more specific error messages
      if (error.message.includes('chrome://')) {
        errorMessage = 'Cannot inspect chrome:// pages - they are restricted for security reasons';
      } else if (error.message.includes('Cannot access a chrome:// URL')) {
        errorMessage = 'Chrome internal pages cannot be inspected for security reasons';
      } else if (error.message.includes('scripting')) {
        errorMessage = 'Cannot execute scripts on this page - it may be protected';
      }
      
      showError(errorMessage);
    }
  }

  // Initial load
  updatePopupInfo();
});
