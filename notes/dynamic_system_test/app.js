
function addNoteBlock() {
    const noteContainer = document.getElementById("note-container");

    const noteBlock = document.createElement("div");
    noteBlock.className = "note-block";

    const topicColumn = createColumn("Topic", "topic-column");
    const contentColumn = createColumnWithButtons("Content", "add-image-button", "add-text-button", "content-column");
    const commentColumn = createColumnWithButtons("Comments", "add-image-button", "add-text-button", "comment-column");

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
        noteContainer.removeChild(noteBlock);
    });

    noteBlock.appendChild(topicColumn);
    noteBlock.appendChild(contentColumn);
    noteBlock.appendChild(commentColumn);
    noteBlock.appendChild(removeButton);

    noteContainer.appendChild(noteBlock);
}

function createColumn(placeholder, className) {
    const column = document.createElement("div");
    column.className = `column ${className}`;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;

    column.appendChild(input);

    return column;
}

function createColumnWithButtons(placeholder, imageButtonClass, textButtonClass, className) {
    const column = document.createElement("div");
    column.className = `column ${className}`;

    const addImageButton = createButton("Add Image", imageButtonClass);
    const addTextButton = createButton("Add Text", textButtonClass);

    // Create a new line break element
    const lineBreak = document.createElement("br");

    column.appendChild(addImageButton);
    column.appendChild(addTextButton);
    // Append the line break element to your target element
    column.appendChild(lineBreak);

    return column;
}

function createButton(text, className) {
    const button = document.createElement("button");
    button.className = className;
    button.textContent = text;
    
    if (text === "Add Text"){
        button.addEventListener("click", () => {
        const input = document.createElement("textarea");
        input.type = "text";
        input.placeholder = "Text";
        input.className = "full-width-textarea";

        // Adding listener for render
        const render = document.createElement("div");
        render.className = "render";
        input.addEventListener("input", function (input) {
            const inputText = input.target.value;
            const formattedText = formatText(inputText);
            render.innerHTML = formattedText;
            // Adding to the queue for MathJax rendering
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "render"]);
        });

        // Attach an input event listener for auto-resize
        input.addEventListener('input', function() {
            input.style.height = 'auto'; // Reset height to auto
            input.style.height = `${input.scrollHeight}px`; // Set height to scrollHeight
        });

        const lineBreak = document.createElement("br");
        const removeButton = createRemoveButton(button.parentElement, input, lineBreak);
        



        button.parentElement.appendChild(input);
        button.parentElement.appendChild(removeButton);
        button.parentElement.appendChild(render);
        button.parentElement.appendChild(lineBreak);
        });
    } else {
        button.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = 'Image URL';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';

            const previewImage = document.createElement('img');
            previewImage.className = 'img';
            imgContainer.appendChild(previewImage);

            input.addEventListener('input', () => {
                previewImage.src = 'assets/'+ input.value;
            });

            const lineBreak = document.createElement("br");
            const removeButton = createRemoveButton(button.parentElement, input, imgContainer, lineBreak);


            button.parentElement.appendChild(input);
            button.parentElement.appendChild(removeButton);
            button.parentElement.appendChild(imgContainer);
            button.parentElement.appendChild(lineBreak);
        });

    }

    return button;
}

function createRemoveButton(column, ...list2remove) {
    const removeButton = document.createElement("button");
    removeButton.className = "remove-input-button";
    removeButton.textContent = "X";

    removeButton.addEventListener("click", () => {
        for (let i = 0; i < list2remove.length; i++){
            column.removeChild(list2remove[i]);
        }
        column.removeChild(removeButton);
    });

    return removeButton;
}


function updateValue(e) {
    const inputText = e.target.value;
    const formattedText = formatText(inputText);
    log.innerHTML = formattedText;
    // Adding to the queue for MathJax rendering
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "render"]);
  }

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
    text = text.replace(/==(.*?)==/g, '<span style="color: lightblue;">$1</span>');
    
    return text;
  }