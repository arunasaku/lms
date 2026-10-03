/**
 * 🔒 Code Protection Script
 * This script implements multiple layers of protection against code copying
 */

(function() {
  'use strict';

  // ========== 1. DISABLE RIGHT-CLICK ==========
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // ========== 2. DISABLE KEYBOARD SHORTCUTS ==========
  document.addEventListener('keydown', function(e) {
    // F12 - Developer Tools
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C - DevTools
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || 
        e.key === 'J' || e.key === 'j' || 
        e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U - View Source
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S - Save Page
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+P - Print
    if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      return false;
    }
  });

  // ========== 3. DISABLE TEXT SELECTION ON CODE ==========
  document.addEventListener('selectstart', function(e) {
    var target = e.target;
    // Allow selection in input fields
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }
    e.preventDefault();
  });

  // ========== 4. DISABLE DRAG ==========
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // ========== 5. ANTI-DEBUGGING DETECTION ==========
  var devtoolsOpen = false;
  var threshold = 160;

  // Detect DevTools by window size difference
  setInterval(function() {
    var widthThreshold = window.outerWidth - window.innerWidth > threshold;
    var heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
      }
    } else {
      devtoolsOpen = false;
    }
  }, 500);

  // ========== 6. CONSOLE WARNING ==========
  console.log('%c⚠️ WARNING!', 'color: red; font-size: 50px; font-weight: bold;');
  console.log('%cThis is a browser feature intended for developers.', 'color: black; font-size: 16px;');
  console.log('%cIf someone told you to copy-paste something here, it is a scam.', 'color: black; font-size: 16px;');
  console.log('%c© 2024 HR Management System - All Rights Reserved. Unauthorized copying is prohibited.', 'color: gray; font-size: 12px;');

  // ========== 7. DISABLE LARGE COPY ==========
  document.addEventListener('copy', function(e) {
    var selection = window.getSelection();
    if (selection) {
      var text = selection.toString();
      if (text.length > 200) {
        e.preventDefault();
      }
    }
  });

  // ========== WARNING POPUP ==========
  function showWarning(message) {
    // Remove existing warning if any
    var existing = document.getElementById('protection-warning');
    if (existing) existing.remove();

    var warning = document.createElement('div');
    warning.id = 'protection-warning';
    warning.innerHTML = '<div style="position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#ef4444,#dc2626);color:white;padding:12px 24px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:999999;font-family:system-ui,sans-serif;font-size:14px;font-weight:500;display:flex;align-items:center;gap:10px;animation:slideDown 0.3s ease-out;max-width:90vw;">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' +
      '<span>' + message + '</span>' +
      '</div>';
    document.body.appendChild(warning);

    // Auto remove after 3 seconds
    setTimeout(function() {
      var el = document.getElementById('protection-warning');
      if (el && el.parentNode) {
        el.remove();
      }
    }, 3000);
  }

  // Add animation keyframes
  var style = document.createElement('style');
  style.textContent = '@keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }';
  document.head.appendChild(style);

  // ========== 8. WATERMARK ==========
  function addWatermark() {
    var watermark = document.createElement('div');
    watermark.style.cssText = 'position:fixed;bottom:10px;right:10px;font-size:10px;color:rgba(0,0,0,0.08);pointer-events:none;z-index:9999;font-family:monospace;user-select:none;';
    watermark.textContent = '© Protected Content - Do Not Copy';
    document.body.appendChild(watermark);
  }
  
  // Add watermark after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWatermark);
  } else {
    addWatermark();
  }

})();
