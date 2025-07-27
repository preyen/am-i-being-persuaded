// content.js
// This script runs in the context of the current webpage to scrape its content.

(function() {
    // Function to get the main article content
    function getArticleContent() {
        let content = '';
        let title = document.querySelector('h1')?.innerText || document.title;
        content += `Title: ${title}\n\n`;

        // Attempt to find the main article element
        const articleElement = document.querySelector('article') ||
                               document.querySelector('main') ||
                               document.getElementById('content') ||
                               document.querySelector('.article-body') ||
                               document.querySelector('.post-content');

        if (articleElement) {
            // If a specific article element is found, try to extract paragraphs and headings
            const paragraphs = articleElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
            paragraphs.forEach(p => {
                // Filter out elements that are likely not part of the main text
                if (p.offsetParent !== null && // Check if element is visible
                    !p.closest('header') &&
                    !p.closest('footer') &&
                    !p.closest('nav') &&
                    !p.closest('aside') &&
                    !p.closest('.sidebar') &&
                    !p.closest('.comments') &&
                    !p.closest('.related-articles') &&
                    !p.closest('.advertisement') &&
                    !p.closest('.meta-info') &&
                    !p.classList.contains('caption') && // Exclude image captions
                    p.innerText.trim().length > 10 // Only include substantial text
                ) {
                    content += p.innerText.trim() + '\n\n';
                }
            });
        } else {
            // Fallback: if no specific article element, try to get all paragraphs
            const allParagraphs = document.querySelectorAll('p');
            allParagraphs.forEach(p => {
                if (p.offsetParent !== null && p.innerText.trim().length > 10) {
                    content += p.innerText.trim() + '\n\n';
                }
            });
        }

        // Add publication date if found
        const dateElement = document.querySelector('time[datetime], .pub-date, .date');
        if (dateElement && dateElement.innerText.trim()) {
            content += `\nPublished Date: ${dateElement.innerText.trim()}\n`;
        }

        // Add author if found
        const authorElement = document.querySelector('.author, .byline, [rel="author"]');
        if (authorElement && authorElement.innerText.trim()) {
            content += `\nAuthor: ${authorElement.innerText.trim()}\n`;
        }

        // Clean up excessive newlines
        content = content.replace(/\n\n\n+/g, '\n\n').trim();

        return content;
    }

    // Return the scraped content. This will be the result of executeScript.
    return getArticleContent();
})();
