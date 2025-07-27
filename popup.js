document.addEventListener('DOMContentLoaded', () => {
    const evaluateButton = document.getElementById('evaluateButton');
    const resultDisplay = document.getElementById('resultDisplay');
    const messageDiv = document.getElementById('message');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const apiKeyMessageDiv = document.getElementById('apiKeyMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    let geminiApiKey = ""; // This will store the API key from storage

    // Load API key from storage
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            geminiApiKey = result.geminiApiKey;
            apiKeyInput.value = geminiApiKey; // Pre-fill input if key exists
            showMessage(apiKeyMessageDiv, 'API Key loaded successfully!', 'success');
        } else {
            showMessage(apiKeyMessageDiv, 'Please enter your Gemini API Key.', 'error');
        }
    });

    // Save API key to storage
    saveApiKeyButton.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            chrome.storage.local.set({ 'geminiApiKey': key }, () => {
                geminiApiKey = key;
                showMessage(apiKeyMessageDiv, 'API Key saved!', 'success');
            });
        } else {
            showMessage(apiKeyMessageDiv, 'API Key cannot be empty.', 'error');
        }
    });

    evaluateButton.addEventListener('click', async () => {
        if (!geminiApiKey) {
            showMessage(messageDiv, 'Please save your Gemini API Key first.', 'error');
            return;
        }

        resultDisplay.value = 'Scraping article content...';
        showMessage(messageDiv, '', ''); // Clear previous messages
        loadingSpinner.style.display = 'block'; // Show spinner

        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.id) {
                throw new Error("Could not get active tab.");
            }

            // Execute content script to scrape the article
            const response = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            const articleContent = response[0]?.result;

            if (!articleContent || articleContent.trim() === '') {
                showMessage(messageDiv, 'Could not scrape meaningful article content from this page. Try a different page or check its structure.', 'error');
                resultDisplay.value = '';
                loadingSpinner.style.display = 'none';
                return;
            }

            resultDisplay.value = 'Content scraped. Sending to Gemini API for evaluation...';

            // Construct the prompt with the scraped content
            const prompt = `Prompt: Article Misinformation Assessment (JSON Output)

You are an expert fact-checker and critical thinking specialist, tasked with evaluating the provided article for potential misinformation, bias, and logical flaws, using the principles outlined in "Foolproof: Why Misinformation Infects Our Minds and How to Build Immunity."

Analyze the given article thoroughly against each of the following criteria. For each criterion, determine if it passes ("Yes"), fails ("No"), or is not applicable ("N/A"). Provide a brief, specific explanation and cite examples_from_article to support your assessment for each point.

Your final output must be a single JSON object. The structure should be as follows:

JSON

{
  "article_title": "[Title of the Article]",
  "evaluation_date": "[Current Date, YYYY-MM-DD]",
  "criteria_evaluation": {
    "source_credibility": {
      "author_identifiable_reputable": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "publication_known_for_accuracy": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "url_legitimate": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "evidence_support": {
      "claims_backed_by_data": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "includes_expert_original_reporting": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "visual_aids_accurate_not_misleading": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "logic_reasoning": {
      "argument_clear_coherent": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "logical_fallacies_present": {
        "status": "Yes/No/N/A",
        "explanation": "Identify specific fallacies and brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "conclusions_justified_by_evidence": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "emotional_manipulation": {
      "exaggerated_language_fear_tactics": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "headlines_clickbaity_sensational": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation, quote headline.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "emotional_appeal_overrides_logic": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation of how emotions are targeted.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "bias_detection": {
      "perspective_balanced": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "opposing_views_represented_fairly": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "loaded_language_ideological_slant": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "language_tone": {
      "language_clear_professional": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "grammar_spelling_errors_present": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation, list a few if present.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "tone_respectful_not_inflammatory": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "timeliness_relevance": {
      "content_current_up_to_date": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "accurately_reflects_latest_developments": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "relevant_to_topic_query": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "reproducibility_verifiability": {
      "claims_cross_referenced_reputable_sources": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "links_to_original_data_documentation": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "transparency_around_methodology": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    },
    "social_signals": {
      "comments_insightful_reactive": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "signs_of_coordinated_boosting": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      },
      "content_shared_without_validation": {
        "status": "Yes/No/N/A",
        "explanation": "Brief explanation.",
        "examples_from_article": ["Example 1", "Example 2"]
      }
    }
  },
  "overall_assessment": {
    "reliability": "[Overall reliability assessment, e.g., 'Highly Reliable', 'Moderately Reliable', 'Low Reliability', 'Unreliable']",
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2",
      "Recommendation 3"
    ]
  }
}
Article to Analyze: ${articleContent}`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    //responseSchema:                     
                }
            };

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

            const response2 = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response2.ok) {
                const errorData = await response2.json();
                throw new Error(`API Error: ${response2.status} - ${errorData.error?.message || response2.statusText}`);
            }

            const result = await response2.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const jsonText = result.candidates[0].content.parts[0].text;
                try {
                    const parsedJson = JSON.parse(jsonText);
                    resultDisplay.style.display = "none"; // Hide textarea
                    let prettyDiv = document.getElementById('prettyResult');
                    if (!prettyDiv) {
                        prettyDiv = document.createElement('div');
                        prettyDiv.id = 'prettyResult';
                        prettyDiv.style.marginTop = '1em';
                        prettyDiv.style.maxHeight = '400px';
                        prettyDiv.style.overflowY = 'auto';
                        resultDisplay.parentNode.insertBefore(prettyDiv, resultDisplay.nextSibling);
                    }
                    prettyDiv.innerHTML = renderTabularEvaluation(parsedJson);
                    showMessage(messageDiv, 'Evaluation complete!', 'success');
                } catch (parseError) {
                    resultDisplay.style.display = "";
                    resultDisplay.value = `Error parsing JSON from API: ${parseError.message}\nRaw response:\n${jsonText}`;
                    showMessage(messageDiv, 'Error processing API response.', 'error');
                }
            } else {
                resultDisplay.value = 'No valid content found in API response.';
                showMessage(messageDiv, 'No content from API.', 'error');
            }

        } catch (error) {
            console.error('Error:', error);
            resultDisplay.value = `Error: ${error.message}`;
            showMessage(messageDiv, `An error occurred: ${error.message}`, 'error');
        } finally {
            loadingSpinner.style.display = 'none'; // Hide spinner
        }
    });

    function showMessage(element, text, type) {
        element.textContent = text;
        element.classList.remove('hidden', 'message-success', 'message-error');
        if (type === 'success') {
            element.classList.add('message-success');
        } else if (type === 'error') {
            element.classList.add('message-error');
        } else {
            // No specific type, just show the text
        }
        if (text) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }

    
    function renderTabularEvaluation(data) {
        if (!data) return "<div>No data to display.</div>";
        let html = `
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 class="text-lg font-bold text-blue-700 mb-2">${data.article_title || "Untitled Article"}</h3>
                <div class="text-sm text-gray-600 mb-2">Evaluated: ${data.evaluation_date || ""}</div>
                <h4 class="font-semibold text-blue-600 mt-3 mb-1">Overall Assessment</h4>
                <table class="min-w-full mb-3 text-sm">
                    <tr>
                        <td class="font-semibold pr-2">Reliability:</td>
                        <td>${data.overall_assessment?.reliability || ""}</td>
                    </tr>
                    <tr>
                        <td class="font-semibold pr-2 align-top">Recommendations:</td>
                        <td>
                            <ul class="list-disc ml-6">
                                ${(data.overall_assessment?.recommendations || []).map(r => `<li>${r}</li>`).join("")}
                            </ul>
                        </td>
                    </tr>
                </table>
                <h4 class="font-semibold text-blue-600 mt-3 mb-1">Criteria Evaluation</h4>
                ${renderCriteriaTables(data.criteria_evaluation)}
            </div>
        `;
        return html;
    }

    function renderCriteriaTables(criteria) {
        if (!criteria) return "";
        let html = "";
        for (const [section, sectionObj] of Object.entries(criteria)) {
            html += `<div class="mb-4">
                <div class="font-semibold text-gray-700 mb-1">${section.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                <table class="min-w-full text-xs border mb-2">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="p-1 border">Criterion</th>
                            <th class="p-1 border">Status</th>
                            <th class="p-1 border">Explanation</th>
                            <th class="p-1 border">Examples</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            for (const [criterion, critObj] of Object.entries(sectionObj)) {
                html += `
                    <tr>
                        <td class="border p-1 font-medium">${criterion.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td class="border p-1">${critObj.status || ""}</td>
                        <td class="border p-1">${critObj.explanation || ""}</td>
                        <td class="border p-1">
                            <ul class="list-disc ml-4">
                                ${(critObj.examples_from_article || []).map(e => `<li>${e}</li>`).join("")}
                            </ul>
                        </td>
                    </tr>
                `;
            }
            html += `</tbody></table></div>`;
        }
        return html;
    }
});
