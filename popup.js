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
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "article_title": { "type": "STRING" },
                            "evaluation_date": { "type": "STRING" },
                            "criteria_evaluation": {
                                "type": "OBJECT",
                                "properties": {
                                    "source_credibility": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "author_identifiable_reputable": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "publication_known_for_accuracy": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "url_legitimate": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "evidence_support": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "claims_backed_by_data": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "includes_expert_original_reporting": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "visual_aids_accurate_not_misleading": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "logic_reasoning": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "argument_clear_coherent": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "logical_fallacies_present": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "conclusions_justified_by_evidence": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "emotional_manipulation": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "exaggerated_language_fear_tactics": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "headlines_clickbaity_sensational": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "emotional_appeal_overrides_logic": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "bias_detection": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "perspective_balanced": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "opposing_views_represented_fairly": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "loaded_language_ideological_slant": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "language_tone": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "language_clear_professional": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "grammar_spelling_errors_present": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "tone_respectful_not_inflammatory": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "timeliness_relevance": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "content_current_up_to_date": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "accurately_reflects_latest_developments": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "relevant_to_topic_query": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "reproducibility_verifiability": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "claims_cross_referenced_reputable_sources": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "links_to_original_data_documentation": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "transparency_around_methodology": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    },
                                    "social_signals": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "comments_insightful_reactive": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "signs_of_coordinated_boosting": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            },
                                            "content_shared_without_validation": {
                                                "type": "OBJECT",
                                                "properties": {
                                                    "status": { "type": "STRING" },
                                                    "explanation": { "type": "STRING" },
                                                    "examples_from_article": { "type": "ARRAY", "items": { "type": "STRING" } }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "overall_assessment": {
                                "type": "OBJECT",
                                "properties": {
                                    "reliability": { "type": "STRING" },
                                    "recommendations": { "type": "ARRAY", "items": { "type": "STRING" } }
                                }
                            }
                        }
                    }
                }
            };

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

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
                    resultDisplay.value = JSON.stringify(parsedJson, null, 2);
                    showMessage(messageDiv, 'Evaluation complete!', 'success');
                } catch (parseError) {
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
});
