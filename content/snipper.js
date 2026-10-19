(function() {
  console.log("%c[IRCTC AUTO] Engine Loaded", "color: lime; font-size: 14px; font-weight: bold;");

  const STATE = {
    isSearching: false,
    isBooking: false,
    isPaying: false,
    targetCaptcha: null,
    targetInput: null
  };

  // 1. CAPTCHA SOLVER (OCR Placeholder)
  function solveCaptcha() {
    const img = document.querySelector("img[src*='captcha'], #captchaImage");
    const input = document.querySelector("input[name='captcha'], #captcha");
    
    if (!img || !input) return false;

    STATE.targetCaptcha = img;
    STATE.targetInput = input;

    // Send image to background for OCR (or use Tesseract directly here)
    // For this script, we simulate the OCR result
    const solution = "A1B2"; // Replace with real OCR logic: Tesseract.recognize(img.src, 'eng').then(...)

    input.value = solution;
    input.focus();
    console.log(`%c[CAPTCHA] Solved: ${solution}`, "color: cyan;");
    return true;
  }

  // 2. WALLET PAYMENT INJECTOR
  function forceWalletPayment() {
    // IRCTC Wallet Radio Button Selector
    const walletRadio = document.querySelector("input[type='radio'][value='WALLET'], #walletRadio");
    const payBtn = document.querySelector("button[id*='payButton'], .btn-primary, input[id*='pay']");

    if (walletRadio && !walletRadio.checked) {
      walletRadio.click();
      walletRadio.checked = true;
      console.log("%c[WALLET] Selected", "color: yellow;");
    }

    if (payBtn) {
      payBtn.click();
      console.log("%c[PAYMENT] Clicked", "color: green;");
    }
  }

  // 3. MAIN BOOKING ENGINE (MutationObserver for Speed)
  function startEngine() {
    const observer = new MutationObserver((mutations) => {
      if (STATE.isPaying) {
        // If we are on the payment page, check for wallet
        if (document.title.includes("Payment") || document.querySelector("#walletRadio")) {
          forceWalletPayment();
          STATE.isPaying = false;
          return;
        }
      }

      // Check for the "Book" button on the search results page
      const bookBtn = document.querySelector("button[id*='Book'], .btn-book, #btnBook");
      
      if (bookBtn && !bookBtn.disabled) {
        console.log("%c[TATKAL] Button Found!", "color: red; font-weight: bold;");
        STATE.isBooking = true;
        
        // Step 1: Solve Captcha
        if (solveCaptcha()) {
          // Step 2: Click Book
          setTimeout(() => {
            bookBtn.click();
            STATE.isPaying = true; // Prepare for payment page
          }, 500); // Small delay to ensure captcha is registered
        }
      }
    });

    // Observe the entire document for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial check
    const initialBtn = document.querySelector("button[id*='Book'], .btn-book");
    if (initialBtn) observer.takeRecords();
  }

  // Listen for start command from Popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "START_AUTO_BOOK") {
      startEngine();
      sendResponse({ status: "running" });
    }
  });

})();
