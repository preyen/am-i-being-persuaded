// content.js
// This script runs in the context of the current webpage to scrape its content.

(function() {
    // Function to get the main article content
    function getArticleContent() {
        let content = '';
        let title = document.querySelector('h1')?.innerText || document.title;
        content += `Title: ${title}\n`;
        content += `URL: ${window.location.href}\n\n`;

        // Get all visible text nodes
        function getAllVisibleText() {
            let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode: function(node) {
                    if (!node.parentElement) return NodeFilter.FILTER_REJECT;
                    const style = window.getComputedStyle(node.parentElement);
                    if (style && (style.visibility === 'hidden' || style.display === 'none')) return NodeFilter.FILTER_REJECT;
                    if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            });
            let text = '';
            let node;
            while (node = walker.nextNode()) {
                text += node.nodeValue.trim() + '\n';
            }
            return text;
        }

        // Get all image alt text
        function getAllAltText() {
            const images = document.querySelectorAll('img[alt]');
            let altTexts = [];
            images.forEach(img => {
                if (img.alt && img.alt.trim().length > 0) {
                    altTexts.push(img.alt.trim());
                }
            });
            return altTexts.length ? ('\nImage Alt Texts:\n' + altTexts.join('\n')) : '';
        }

        content += getAllVisibleText();
        content += getAllAltText();

        return content.trim();
    }

    // Return the scraped content. This will be the result of executeScript.
    return getArticleContent();
})();
