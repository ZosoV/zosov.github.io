function formatText(text) {
    // Replace **word** with <strong>word</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *word* with <em>word</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace __word__ with <u>word</u>
    text = text.replace(/__(.*?)__/g, '<u>$1</u>');
    // Replace ~~word~~ with <s>word</s> for strikethrough
    text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
    // Replace ^word^ with <sup>word</sup> for superscript
    text = text.replace(/\^(.*?)\^/g, '<sup>$1</sup>');
    // Replace ~word~ with <sub>word</sub> for subscript
    text = text.replace(/~(.*?)~/g, '<sub>$1</sub>');
    // Replace ==word== with <span style="color: lightblue;">word</span> for highlighting
    text = text.replace(/==(.*?)==/g, '<span style="color: #69BACD;">$1</span>');
    // Replace ==word== with <span style="color: lightblue;">word</span> for highlighting
    text = text.replace(/--(.*?)--/g, '<span style="color: #EF6943;">$1</span>');            
    
    return text;
    }

    // Apply formatText to the paragraphs
    document.addEventListener("DOMContentLoaded", function () {
        const paragraphs = document.querySelectorAll(".content-column p");
        paragraphs.forEach(function (paragraph) {
            paragraph.innerHTML = formatText(paragraph.innerHTML);
        });

        const commentParagraphs = document.querySelectorAll(".comment-column p");
        commentParagraphs.forEach(function (paragraph) {
            paragraph.innerHTML = formatText(paragraph.innerHTML);
        });
    });