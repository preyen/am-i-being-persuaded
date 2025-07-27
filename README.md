# Article Misinformation Evaluator Chrome Extension

This Chrome Extension helps users critically evaluate articles for potential misinformation, bias, and logical flaws directly within their browser. It leverages the Google Gemini API to analyze the content of the currently viewed webpage against a comprehensive checklist derived from the book "Foolproof: Why Misinformation Infects Our Minds and How to Build Immunity."

## ✨ Features

* **In-Browser Article Analysis:** Scrapes the main content of the active webpage.
* **AI-Powered Evaluation:** Sends scraped content to the Google Gemini API for detailed assessment.
* **Structured JSON Output:** Returns a comprehensive evaluation in a clear, readable JSON format, covering:
  * Source Credibility
  * Evidence & Support
  * Logic & Reasoning
  * Emotional Manipulation
  * Bias Detection
  * Language & Tone
  * Timeliness & Relevance
  * Reproducibility & Verifiability
  * Social Signals (where applicable)
* **Reliability Assessment:** Provides an overall reliability score and recommendations.
* **API Key Management:** Allows users to securely save their Gemini API key within the extension.

## 🔑 Obtaining a Google Gemini API Key

This extension requires a Google Gemini API key to function.

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Follow the instructions to create a new API key.
4. Copy your generated API key.

## ⚙️ Usage

1. **Open the Extension:** Click the "Article Misinformation Evaluator" icon in your Chrome toolbar.
2. **Save API Key:** In the popup, paste your Google Gemini API Key into the input field and click "Save API Key". You only need to do this once.
3. **Navigate to an Article:** Go to any webpage containing an article you wish to evaluate.
4. **Evaluate:** Click the "Evaluate Article" button in the extension popup.
5. **View Results:** The extension will scrape the article content, send it to the Gemini API, and display the detailed JSON evaluation in the text area. A loading spinner will indicate activity.


## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or encounter issues, please feel free to open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
