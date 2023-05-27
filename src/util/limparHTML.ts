import sanitizeHtml from "sanitize-html";

const limparHTML = (html: string) => {
    return sanitizeHtml(html, {
        allowedTags: [ "b", "i", "em", "strong", "a" ],
        allowedAttributes: {
            "a": [ "href" ]
        }
      });
};

export default limparHTML;