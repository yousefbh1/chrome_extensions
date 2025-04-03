// Line Cut for Google Docs
// Similar to VS Code, this allows cutting an entire line with Ctrl+X

console.log("Line Cut for Google Docs extension loaded");

let isEnabled = false;
let isDebugging = true;

function debugLog(message) {
  if (isDebugging) {
    console.log(`[LineCut Debug] ${message}`);
  }
}

// Direct key logging
document.addEventListener('keydown', function(e) {
  console.log(`Key pressed: ${e.key} (ctrl: ${e.ctrlKey}, shift: ${e.shiftKey}, alt: ${e.altKey})`);
});

// Add iframe event listeners after a delay to ensure the iframe is loaded
function setupIframeListeners() {
  debugLog("Setting up iframe key listeners");
  
  // Try to find the Google Docs editor iframe
  const editorIframes = document.querySelectorAll('iframe');
  debugLog(`Found ${editorIframes.length} iframes`);
  
  editorIframes.forEach((iframe, index) => {
    try {
      debugLog(`Attempting to access iframe ${index}`);
      if (iframe.contentDocument) {
        debugLog(`Successfully accessed iframe ${index}`);
        // Add key logging to iframe document
        iframe.contentDocument.addEventListener('keydown', function(e) {
          console.log(`[Iframe ${index}] Key pressed: ${e.key} (ctrl: ${e.ctrlKey}, shift: ${e.shiftKey}, alt: ${e.altKey})`);
          
          // Handle Ctrl+X within this iframe
          if (isEnabled && e.ctrlKey && e.key === 'x') {
            debugLog(`[Iframe ${index}] Ctrl+X detected`);
            
            // Get the selection within this iframe
            const selection = iframe.contentDocument.getSelection();
            const selectionText = selection.toString();
            debugLog(`[Iframe ${index}] Selection text: "${selectionText}"`);
            
            // Only handle if selection is empty or only contains whitespace
            if (selectionText.trim() === '') {
              debugLog(`[Iframe ${index}] No text selected, attempting to cut line`);
              
              // Prevent default cut behavior
              e.preventDefault();
              e.stopPropagation();
              debugLog(`[Iframe ${index}] Default cut behavior prevented`);
              
              // Execute the line cutting directly in this iframe
              executeIframeLineCut(iframe);
              
              return false;
            } else {
              debugLog(`[Iframe ${index}] Text already selected, letting default cut behavior happen`);
            }
          }
        }, true);
        debugLog(`Added key listener to iframe ${index}`);
      }
    } catch (e) {
      debugLog(`Cannot access iframe ${index} due to cross-origin policy: ${e.message}`);
    }
  });
  
  // Also try the specific class that Google Docs uses
  const docsIframe = document.querySelector('.docs-texteventtarget-iframe');
  if (docsIframe) {
    debugLog("Found Google Docs text event target iframe");
    try {
      if (docsIframe.contentDocument) {
        docsIframe.contentDocument.addEventListener('keydown', function(e) {
          console.log(`[Docs Iframe] Key pressed: ${e.key} (ctrl: ${e.ctrlKey}, shift: ${e.shiftKey}, alt: ${e.altKey})`);
          
          // Handle Ctrl+X within Docs iframe
          if (isEnabled && e.ctrlKey && e.key === 'x') {
            debugLog(`[Docs Iframe] Ctrl+X detected`);
            
            // Get the selection within this iframe
            const selection = docsIframe.contentDocument.getSelection();
            const selectionText = selection.toString();
            debugLog(`[Docs Iframe] Selection text: "${selectionText}"`);
            
            // Only handle if selection is empty or only contains whitespace
            if (selectionText.trim() === '') {
              debugLog(`[Docs Iframe] No text selected, attempting to cut line`);
              
              // Prevent default cut behavior
              e.preventDefault();
              e.stopPropagation();
              debugLog(`[Docs Iframe] Default cut behavior prevented`);
              
              // Execute the line cutting directly in this iframe
              executeIframeLineCut(docsIframe);
              
              return false;
            } else {
              debugLog(`[Docs Iframe] Text already selected, letting default cut behavior happen`);
            }
          }
        }, true);
        debugLog("Added key listener to Docs iframe");
      }
    } catch (e) {
      debugLog(`Cannot access Docs iframe due to cross-origin policy: ${e.message}`);
    }
  } else {
    debugLog("Could not find Google Docs text event target iframe");
  }
  
  // Alternative key logging method - observe the document for changes
  setupFallbackKeyTracking();
}

// Set up fallback key tracking by watching for document changes
function setupFallbackKeyTracking() {
  debugLog("Setting up fallback key tracking via document changes");
  
  // Try to capture keystrokes by monitoring input element values
  let lastActiveElement = null;
  let lastValue = '';
  
  // Check for active element changes frequently
  setInterval(() => {
    const activeEl = document.activeElement;
    
    if (activeEl !== lastActiveElement) {
      debugLog(`Active element changed to: ${activeEl.tagName}`);
      lastActiveElement = activeEl;
      
      if (activeEl.value !== undefined) {
        lastValue = activeEl.value;
        debugLog(`Initial value: "${lastValue}"`);
      }
    }
    
    // Check if value changed, which might indicate keypresses
    if (activeEl.value !== undefined && activeEl.value !== lastValue) {
      const newValue = activeEl.value;
      const diff = newValue.length - lastValue.length;
      
      if (diff > 0) {
        // Text was added
        const addedText = newValue.slice(lastValue.length);
        console.log(`[Fallback] Text added: "${addedText}" (${diff} chars)`);
      } else if (diff < 0) {
        // Text was removed
        console.log(`[Fallback] Text removed (${-diff} chars)`);
      }
      
      lastValue = newValue;
    }
  }, 100);
  
  // Watch for mutations in the document text content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'characterData') {
        console.log(`[MutationObserver] Text changed: "${mutation.target.textContent}"`);
      } else if (mutation.addedNodes.length > 0) {
        console.log(`[MutationObserver] ${mutation.addedNodes.length} nodes added`);
      } else if (mutation.removedNodes.length > 0) {
        console.log(`[MutationObserver] ${mutation.removedNodes.length} nodes removed`);
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  debugLog("Fallback key tracking setup complete");
}

// Wait for Google Docs to fully load
function initExtension() {
  debugLog("Initializing extension");
  
  // Check if we're in a Google Docs document
  if (window.location.href.indexOf('docs.google.com/document') === -1) {
    debugLog("Not in Google Docs document, disabling extension");
    return;
  }
  
  debugLog("In Google Docs document, setting up extension");
  isEnabled = true;
  
  debugLog("Extension initialization complete");
  
  // Set up iframe listeners after a delay to ensure iframes are loaded
  setTimeout(setupIframeListeners, 2000);
}

// Initialize when page loads
window.addEventListener('load', initExtension);

// Alternative initialization method if the load event has already fired
if (document.readyState === 'complete') {
  debugLog("Document already loaded, initializing now");
  initExtension();
}

// Add a keydown listener to monitor ALL keys for debugging
document.addEventListener('keydown', function(e) {
  debugLog(`Key pressed: ${e.key} (ctrl: ${e.ctrlKey}, shift: ${e.shiftKey}, alt: ${e.altKey})`);
}, true);

// Listen for Ctrl+X keydown events
document.addEventListener('keydown', function(event) {
  if (!isEnabled) {
    debugLog("Extension not enabled, ignoring key event");
    return;
  }
  
  // Check for Ctrl+X
  if (event.ctrlKey && event.key === 'x') {
    debugLog("Ctrl+X detected");
    
    // Get the selection
    const selection = window.getSelection();
    const selectionText = selection.toString();
    debugLog(`Selection text: "${selectionText}"`);
    
    // Only handle if selection is empty or only contains whitespace
    if (selectionText.trim() === '') {
      debugLog("No text selected, attempting to cut line");
      
      // Prevent default cut behavior
      event.preventDefault();
      event.stopPropagation();
      debugLog("Default cut behavior prevented");
      
      // Execute the line cutting directly
      executeLineCut();
    } else {
      debugLog("Text already selected, letting default cut behavior happen");
    }
  }
});

function executeLineCut() {
  debugLog("*** STARTING LINE CUT OPERATION ***");
  try {
    // Direct approach - Using JavaScript to create keyboard events
    debugLog("Attempting to cut line with direct method");
    
    // Select the line using triple-click simulation
    tripleClickCurrentLine();
  } catch (e) {
    debugLog(`Error executing line cut: ${e.message}`);
    debugLog(`Error stack: ${e.stack}`);
  }
}

function tripleClickCurrentLine() {
  debugLog("Starting tripleClickCurrentLine method");
  try {
    // Step 1: Manually press keyboard shortcuts in the document
    debugLog("Manually executing keyboard sequence");
    
    // Execute Home key (move to beginning of line)
    debugLog("Step 1: Dispatching Home key to move to beginning of line");
    executeKeyboardShortcut('Home');
    
    // Wait a bit, then do Shift+End to select to end of line
    debugLog("Scheduling Shift+End after 50ms");
    setTimeout(() => {
      debugLog("Step 2: Dispatching Shift+End to select to end of line");
      executeKeyboardShortcut('End', true);
      
      // Wait a bit, then cut the selection
      debugLog("Scheduling selection check after 50ms");
      setTimeout(() => {
        debugLog("Step 3: Checking if line is selected");
        // Check if we have a selection
        const selection = window.getSelection();
        const selectedText = selection.toString();
        debugLog(`Selection after Home+Shift+End: "${selectedText}"`);
        
        if (selectedText && selectedText.trim() !== '') {
          // We have text selected, cut it
          debugLog(`Text selected successful, length: ${selectedText.length} chars`);
          
          // Use Clipboard API instead of execCommand
          debugLog("Step 4: Copying text to clipboard using Clipboard API");
          navigator.clipboard.writeText(selectedText)
            .then(() => {
              debugLog("Clipboard API success - text copied");
              // After copying, delete the selection
              debugLog("Step 5: Deleting selected text");
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                debugLog(`Selection range count: ${selection.rangeCount}`);
                selection.deleteFromDocument();
                debugLog("Selection deleted from document");
              } else {
                debugLog("No selection ranges found to delete");
              }
              debugLog("*** LINE CUT OPERATION COMPLETED SUCCESSFULLY ***");
            })
            .catch(err => {
              debugLog(`Clipboard API error: ${err.message}`);
              debugLog("Falling back to execCommand method");
              // Fall back to execCommand as last resort
              document.execCommand('cut');
              debugLog("execCommand('cut') called as fallback");
              debugLog("*** LINE CUT OPERATION COMPLETED WITH FALLBACK ***");
            });
        } else {
          // If that didn't work, try the iframe approach
          debugLog("No text selected after Home+Shift+End, trying iframe approach");
          tryIframeKeyboardEvents();
        }
      }, 50);
    }, 50);
  } catch (e) {
    debugLog(`Triple-click error: ${e.message}`);
    debugLog(`Error stack: ${e.stack}`);
    // Try the iframe approach as fallback
    debugLog("Error in tripleClickCurrentLine, trying iframe approach");
    tryIframeKeyboardEvents();
  }
}

function tryIframeKeyboardEvents() {
  debugLog("Starting tryIframeKeyboardEvents method");
  
  try {
    // Find the Google Docs iframe
    debugLog("Step 1: Looking for Google Docs iframe");
    const iframe = document.querySelector('.docs-texteventtarget-iframe');
    
    if (!iframe) {
      debugLog("Iframe element not found");
      throw new Error("Cannot find Google Docs iframe");
    }
    
    debugLog("Iframe found, checking for contentDocument");
    if (!iframe.contentDocument) {
      debugLog("Iframe contentDocument not accessible");
      throw new Error("Iframe contentDocument not accessible (cross-origin restriction?)");
    }
    
    debugLog("Looking for active element in iframe");
    const target = iframe.contentDocument.activeElement;
    
    if (!target) {
      debugLog("No active element in iframe");
      throw new Error("No active element in iframe");
    }
    
    debugLog(`Active element found: ${target.tagName}`);
    
    // First, go to start of line
    debugLog("Step 2: Dispatching Home key to iframe active element");
    const homeEvent = createKeyEvent('keydown', 'Home');
    target.dispatchEvent(homeEvent);
    debugLog("Home key event dispatched");
    
    // Then, select to end of line with Shift+End
    debugLog("Scheduling Shift+End after 50ms");
    setTimeout(() => {
      debugLog("Step 3: Dispatching Shift+End to iframe active element");
      const endEvent = createKeyEvent('keydown', 'End', true);
      target.dispatchEvent(endEvent);
      debugLog("Shift+End event dispatched");
      
      // Then cut with Ctrl+X
      debugLog("Scheduling Ctrl+X after 50ms");
      setTimeout(() => {
        debugLog("Step 4: Dispatching Ctrl+X to iframe active element");
        const cutEvent = createKeyEvent('keydown', 'x', false, true);
        target.dispatchEvent(cutEvent);
        debugLog("Ctrl+X event dispatched");
        
        debugLog("*** LINE CUT OPERATION COMPLETED WITH IFRAME METHOD ***");
      }, 50);
    }, 50);
  } catch (e) {
    debugLog(`Iframe approach error: ${e.message}`);
    debugLog(`Error stack: ${e.stack}`);
    debugLog("All automated methods failed, showing manual instructions");
    showLastResortHelp();
  }
}

function createKeyEvent(type, key, shiftKey = false, ctrlKey = false) {
  // Key codes for special keys
  const keyCodes = {
    'Home': 36,
    'End': 35,
    'Delete': 46,
    'Backspace': 8
  };
  
  debugLog(`Creating key event: ${type}, key=${key}, shift=${shiftKey}, ctrl=${ctrlKey}`);
  
  // Create event
  const keyEvent = document.createEvent('Event');
  keyEvent.initEvent(type, true, true);
  
  // Set key properties
  keyEvent.key = key;
  keyEvent.code = keyCodes[key] ? key : 'Key' + key.toUpperCase();
  keyEvent.keyCode = keyCodes[key] || key.charCodeAt(0);
  keyEvent.which = keyCodes[key] || key.charCodeAt(0);
  keyEvent.shiftKey = shiftKey;
  keyEvent.ctrlKey = ctrlKey;
  keyEvent.metaKey = false;
  keyEvent.altKey = false;
  
  debugLog(`Key event created with keyCode=${keyEvent.keyCode}`);
  return keyEvent;
}

function executeKeyboardShortcut(key, shiftKey = false, ctrlKey = false) {
  debugLog(`Executing keyboard shortcut: key=${key}, shift=${shiftKey}, ctrl=${ctrlKey}`);
  
  // Find any active element in the document that might receive keyboard events
  const activeElement = document.activeElement || document.body;
  debugLog(`Active element: ${activeElement.tagName}`);
  
  // Create keyboard event
  const event = new KeyboardEvent('keydown', {
    key: key,
    code: key === 'Home' ? 'Home' : key === 'End' ? 'End' : 'Key' + key.toUpperCase(),
    keyCode: key === 'Home' ? 36 : key === 'End' ? 35 : key.charCodeAt(0),
    which: key === 'Home' ? 36 : key === 'End' ? 35 : key.charCodeAt(0),
    shiftKey: shiftKey,
    ctrlKey: ctrlKey,
    bubbles: true,
    cancelable: true
  });
  
  // Dispatch the event
  debugLog(`Dispatching event to active element`);
  activeElement.dispatchEvent(event);
  debugLog(`Event dispatched to active element`);
  
  // Also try document level
  debugLog(`Dispatching event to document`);
  document.dispatchEvent(event);
  debugLog(`Event dispatched to document`);
}

function showLastResortHelp() {
  debugLog("Showing last resort help overlay");
  // Create a helpful overlay explaining manual steps
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '50%';
  overlay.style.left = '50%';
  overlay.style.transform = 'translate(-50%, -50%)';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.color = 'white';
  overlay.style.padding = '20px';
  overlay.style.borderRadius = '8px';
  overlay.style.zIndex = '9999';
  overlay.style.maxWidth = '400px';
  overlay.style.textAlign = 'center';
  overlay.innerHTML = `
    <h3 style="margin-top:0">Can't cut line automatically</h3>
    <p>Due to Google Docs security, we need your help:</p>
    <ol style="text-align:left">
      <li>Triple-click to select the current line</li>
      <li>Press Ctrl+X to cut it</li>
    </ol>
    <p><strong>Tip:</strong> You can also use keyboard shortcuts:</p>
    <ul style="text-align:left">
      <li>Press Home (to go to start of line)</li>
      <li>Hold Shift and press End (to select to end of line)</li>
      <li>Press Ctrl+X (to cut the selection)</li>
    </ul>
    <button id="line-cut-close-overlay" style="padding:5px 10px;margin-top:10px">Got it</button>
  `;
  
  document.body.appendChild(overlay);
  debugLog("Help overlay added to document");
  
  // Add event listener to close button
  document.getElementById('line-cut-close-overlay').addEventListener('click', () => {
    overlay.remove();
    debugLog("Help overlay removed by user");
  });
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.remove();
      debugLog("Help overlay auto-removed after timeout");
    }
  }, 10000);
}

function copyToClipboard(text) {
  debugLog(`Copying to clipboard: "${text}"`);
  
  if (text.trim() === '') {
    debugLog("Nothing to copy - empty text");
    return;
  }
  
  navigator.clipboard.writeText(text)
    .then(() => {
      debugLog("Successfully copied to clipboard using Clipboard API");
    })
    .catch(err => {
      debugLog(`Failed to copy using Clipboard API: ${err.message}`);
      fallbackCopy(text);
    });
}

function fallbackCopy(text) {
  debugLog("Using fallback copy method (execCommand)");
  
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    debugLog("Temporary textarea created and selected");
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      debugLog("Fallback copy successful");
    } else {
      debugLog("Fallback copy failed");
    }
  } catch (e) {
    debugLog(`Fallback copy error: ${e.message}`);
    debugLog(`Error stack: ${e.stack}`);
  }
}

// Function to execute line cut inside an iframe
function executeIframeLineCut(iframe) {
  debugLog(`*** STARTING IFRAME LINE CUT OPERATION ***`);
  try {
    // Get the document inside the iframe
    const iframeDoc = iframe.contentDocument;
    const iframeWin = iframe.contentWindow;
    
    // First, dispatch Home key to go to beginning of line
    debugLog(`Step 1: Dispatching Home key to iframe`);
    const homeEvent = new KeyboardEvent('keydown', {
      key: 'Home',
      code: 'Home',
      keyCode: 36,
      which: 36,
      bubbles: true,
      cancelable: true
    });
    iframeDoc.activeElement.dispatchEvent(homeEvent);
    
    // Wait a bit, then do Shift+End to select to end of line - reduced from 100ms to 30ms
    debugLog(`Scheduling Shift+End after 30ms`);
    setTimeout(() => {
      debugLog(`Step 2: Dispatching Shift+End to iframe`);
      const endEvent = new KeyboardEvent('keydown', {
        key: 'End',
        code: 'End',
        keyCode: 35,
        which: 35,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
      iframeDoc.activeElement.dispatchEvent(endEvent);
      
      // Wait a bit, then perform a Ctrl+C followed by Delete - reduced from 100ms to 30ms
      debugLog(`Scheduling Ctrl+C and Delete after 30ms`);
      setTimeout(() => {
        debugLog(`Step 3: Using direct key sequence in iframe (Ctrl+C then Delete)`);
        
        // Create and dispatch a Ctrl+C keydown event
        debugLog(`Dispatching Ctrl+C to copy selected text`);
        const copyEvent = new KeyboardEvent('keydown', {
          key: 'c',
          code: 'KeyC',
          keyCode: 67,
          which: 67,
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        });
        iframeDoc.activeElement.dispatchEvent(copyEvent);
        
        // Wait a bit for the copy to take effect, then delete - reduced from 50ms to 20ms
        setTimeout(() => {
          debugLog(`Dispatching Delete key to remove selected text`);
          const deleteEvent = new KeyboardEvent('keydown', {
            key: 'Delete',
            code: 'Delete',
            keyCode: 46,
            which: 46,
            bubbles: true,
            cancelable: true
          });
          iframeDoc.activeElement.dispatchEvent(deleteEvent);
          
          debugLog(`*** IFRAME LINE CUT OPERATION COMPLETED WITH MANUAL KEY SEQUENCE ***`);
        }, 20);
      }, 30);
    }, 30); // Reduced from 100ms to ensure faster line selection
  } catch (e) {
    debugLog(`Iframe line cut error: ${e.message}`);
    debugLog(`Error stack: ${e.stack}`);
    showLastResortHelp();
  }
} 