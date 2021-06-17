'use strict';

import '../sass/app.scss';
//-- Autocomplete component


const resultsContainer = document.getElementById("resultsContainer");
const stateInput = document.getElementById("stateInput");
const clearStateInputButton = document.getElementById("clearStateInput");
const selectedContainer = document.getElementById("selectedContainer");
const form = document.getElementById("stateForm");
const inputContainer = document.getElementById("inputContainer");

// Sets focused Element(selected element) to stateInput
let focusedElement = 100;
let results = false;

// Shows/Hides Clear Input Button for stateInput(search bar)
const toggleClearInputButtonVisibility = () => {
    if(stateInput.value.length > 0) {
        clearStateInputButton.className = "fas fa-times-circle clearStateInput";
    } else {
        clearStateInputButton.className = "fas fa-times-circle clearStateInput clearStateInputInvisible";
    };
};

// Hides button to start with
toggleClearInputButtonVisibility();

// Clears all search results and sets focused element back to search bar
const clearResults = () => {
    while (resultsContainer.firstChild) {
        resultsContainer.removeChild(resultsContainer.firstChild);
    };
    focusedElement = 100;
};

// Clears selected result and the clear selected result button
const clearSelected = () => {
    while(selectedContainer.firstChild) {
        selectedContainer.removeChild(selectedContainer.firstChild);
    };
    selectedContainer.className = "selectedContainer";
};

// If we're in our search bar and have search results this brings us to our first result
const focusFirstChild = () => {
    if(resultsContainer.firstChild) {
        resultsContainer.firstChild.focus();
        focusedElement = 0;
    } else return;
};

// Once we're in the list this traverses downwards
const focusNextChild = () => {
    const currentResults = document.querySelectorAll('.result');
    if(currentResults[focusedElement + 1]) {
        currentResults[focusedElement + 1].focus();
        focusedElement++;
    };
};

// This traverses the list upwards
const focusPrevChild = () => {
    const currentResults = document.querySelectorAll('.result')
    if(currentResults[focusedElement - 1]) {
        currentResults[focusedElement - 1].focus();
        focusedElement--;    
    };
};

// Adds remove selected state item
const addRemoveButton = () => {
    const removeSelectedButton = document.createElement("i");
    removeSelectedButton.className = 'removeSelectedButton fas fa-times-circle';
    removeSelectedButton.addEventListener("click", () => {
        clearSelected();
    });
    selectedContainer.appendChild(removeSelectedButton);
};

// This function fetches our data from local states API 
// and populates our results
const getStates = async () => {
    let response = await fetch(`http://localhost:3000/api/states?term=${stateInput.value}`);
    let result = await response.json();
    // Shows/Hides clear input button
    toggleClearInputButtonVisibility();
    // Shows/Hides our border for our search results
    if(stateInput.value.length >= 2 && result.count > 0) {
        inputContainer.className = "stateInputContainer formBorder"
    } else {
        inputContainer.className = "stateInputContainer"
    };
    // If search bar has 2 or more characters start populating results
    if(stateInput.value.length >= 2) {
        if(result.message) { // If no results display no results message
            let x = document.createElement("div");
            x.textContent = result.message;
            x.setAttribute("id", "noResultsMessage");
            resultsContainer.appendChild(x);
        } else { 
            for(let i = 0; i < result.count; i++) {
                let y = document.createElement("input");
                y.setAttribute("value", result.data[i].name);
                y.setAttribute("id", result.data[i].abbreviation);
                y.setAttribute("type", "button");
                y.className = "result";
                resultsContainer.appendChild(y);
            };
        };
    };
    // if result count is greater than 0 add an event listener to each
    // result that allows it to be transferable to our selected div on click
    // and clear our search bar
    if(result.count > 0) {
        results = true;
        for(let i = 0; i < result.count; i++) {
            document.querySelector(`#${result.data[i].abbreviation}`).addEventListener("click", () => {
                if(resultsContainer.contains(document.querySelector(`#${result.data[i].abbreviation}`))) {
                    clearSelected();
                    selectedContainer.appendChild(document.querySelector(`#${result.data[i].abbreviation}`));
                    document.querySelector(`#${result.data[i].abbreviation}`).className = 'selected';
                    inputContainer.className = "stateInputContainer";
                    selectedContainer.className = "selectedContainer selectedContainerFull";
                    addRemoveButton();
                    clearResults();
                    stateInput.value = '';
                    toggleClearInputButtonVisibility();
                };
            });
        };
    } else {
        results = false;
    };
};

// Main event listener, allows up to search, and traverse the results with up and down arrows
// While accounting for edge cases so the component doesn't break from unusual user behavior
form.addEventListener("keyup", (e) => {
    if(e.key === "ArrowDown" && focusedElement === 100 && results) {
        focusFirstChild();
    }else if(e.key === "ArrowDown" && focusedElement === 100 && !results) {
        e.preventDefault();
    }else if(e.key ==="ArrowDown" && focusedElement !== 100 && focusedElement < 59) {
        focusNextChild();
    }else if(e.key ==="ArrowUp" && focusedElement !== 0 && focusedElement < 59){ 
        focusPrevChild();
    }else if(e.key === "ArrowUp" && (focusedElement === 0 || focusedElement === 100)) {
        stateInput.focus();
        focusedElement = 100;
    }else if((e.key === "ArrowLeft" || e.key === "ArrowRight") && focusedElement === 100) {
        e.preventDefault();
    }else if(focusedElement !== 100) {
        e.preventDefault();
    } else {
        clearResults();
        getStates();
    };
});

// Prevent's page reload if user submits input
form.addEventListener("submit", (e) => {
    e.preventDefault();
});

// Sets focused element to search bar when it's clicked
stateInput.addEventListener("click", () => {
    focusedElement = 100;    
});

// clears the input when clear search bar button is clicked.
clearStateInputButton.addEventListener("click", () => {
    stateInput.value = '';
    toggleClearInputButtonVisibility();
    clearResults();
    inputContainer.className = "stateInputContainer";
});

