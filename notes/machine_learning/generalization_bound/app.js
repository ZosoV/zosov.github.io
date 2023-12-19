function formatText(text) {
    // Replace **word** with <strong>word</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *word* with <em>word</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace __word__ with <u>word</u>
    text = text.replace(/__(.*?)__/g, '<span style="color: #4CAF50;"><u>$1</u></span>');
    // Replace ~~word~~ with <s>word</s> for strikethrough
    text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
    // Replace ^word^ with <sup>word</sup> for superscript
    text = text.replace(/\^(.*?)\^/g, '<sup>$1</sup>');
    // Replace ~word~ with <sub>word</sub> for subscript
    text = text.replace(/~(.*?)~/g, '<sub>$1</sub>');
    // Replace ==word== with <span style="color: lightblue;">word</span> for highlighting
    text = text.replace(/==(.*?)==/g, '<span style="color: #48ddff;">$1</span>');
    // Replace ==word== with <span style="color: pink;">word</span> for highlighting
    text = text.replace(/--(.*?)--/g, '<span style="color: #ff66b2;">$1</span>');
    
    return text;
    }

    // Apply formatText to the paragraphs, and list
    document.addEventListener("DOMContentLoaded", function () {
        const paragraphs = document.querySelectorAll(".note-container p, ul, ol");
        paragraphs.forEach(function (paragraph) {
            paragraph.innerHTML = formatText(paragraph.innerHTML);
        });
    });


// Your list of links
// TODO: When you create a new note you have to edit this
var currentIndex = 1;

var linksList = [
    { text: 'Hoeffding Inequality', url: '../hoeffding_ineq/index.html' },
    { text: 'Generalization Bound', url: '../generalization_bound/index.html' },
    { text: 'Dichotomy', url: '../dichotomy/index.html' }
  ];

linksList[currentIndex]['url'] = "index.html";

var prevUrl = (currentIndex > 0) ? linksList[currentIndex-1]['url'] : "#";
var nextUrl = (currentIndex < linksList.length - 1) ? linksList[currentIndex+1]['url'] : "#";

// Function to update the dropdown links
function updateDropdownLinks() {
  var dropdownContent = document.getElementById('dropdownContent');
  var prevLink = document.getElementById('prevLink');
  var nextLink = document.getElementById('nextLink');

  // Clear existing content
  dropdownContent.innerHTML = '';

  // Add links from the list
  linksList.forEach(function(link) {
    var anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.textContent = link.text;
    dropdownContent.appendChild(anchor);
  });

  // Set the href attribute for the previous link
  prevLink.href = prevUrl;
  nextLink.href = nextUrl;
}

// Update the dropdown links when the page loads
window.onload = updateDropdownLinks;