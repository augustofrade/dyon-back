import sanitizeHtml from "sanitize-html";

const limparHTML = (html: string) => {
    return sanitizeHtml(html, {
        allowedTags: [ "u", "em", "strong", "a", "h1", "h2", "h3", "p", "ol", "ul", "li", "br" ],
        allowedAttributes: {
            "a": [ "href", "rel" ]
        }
      });
};

export default limparHTML;