'use strict';

import '../sass/app.scss';
//-- Autocomplete component


const resultsContainer = document.getElementById("resultsContainer");
const stateInput = document.getElementById("stateInput");
const clearStateInputButton = document.getElementById("clearStateInput");
const selectedContainer = document.getElementById("selectedContainer");
const form = document.getElementById("stateForm");
const inputContainer = document.getElementById("inputContainer");

let results = false;
let lastChildFocused = false;
let selected = false;

// Shows/Hides Clear Input Button for stateInput(search bar)
const toggleClearInputButtonVisibility = () => {
    if(stateInput.value.length > 0) {
        clearStateInputButton.className = "fas fa-times-circle clearStateInput";
    } else {
        clearStateInputButton.className = "fas fa-times-circle clearStateInput clearStateInputInvisible";
    };
};

// Toggles if last child is selected
const toggleLastChild = () => {
    if(document.activeElement === resultsContainer.lastChild){
        lastChildFocused=true;
        console.log("Last Child Focused!")
    }else lastChildFocused=false;
}

// Toggles if we selected a state or not
const toggleSelectedElement = () => {
    if(selectedContainer.firstChild){
        if(selectedContainer.firstChild.tagName === 'INPUT'){
            setTimeout(() => selected=true, 500); // Set's slight delay so we don't focus selected element right away
            console.log("Element Selected!")
        }else selected=false;
    }   
}

// Hides button to start with
toggleClearInputButtonVisibility();

// Clears all search results and sets focused element back to search bar
const clearResults = () => {
    while (resultsContainer.firstChild) {
        resultsContainer.removeChild(resultsContainer.firstChild);
    };
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
    } else return;
};

// Once we're in the list this traverses downwards
const focusNextChild = () => {
    if(document.activeElement.nextSibling) {
        document.activeElement.nextSibling.focus();
    };
};

// This traverses the list upwards
const focusPrevChild = () => {
    if(document.activeElement.previousSibling) {
        document.activeElement.previousSibling.focus();
    };
};

const focusLastChild = () => {
    if(resultsContainer.lastChild) {
        resultsContainer.lastChild.focus();
    } else return;
}

// Adds remove selected state item
const addRemoveButton = () => {
    const removeSelectedButton = document.createElement("i");
    removeSelectedButton.className = 'removeSelectedButton fas fa-times-circle';
    removeSelectedButton.addEventListener("click", () => {
        clearSelected();
        // clearResults();
        toggleSelectedElement();
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
        // Passes the event listener to child through event delegation
        resultsContainer.addEventListener("click", (e) => {
            clearSelected();
            selectedContainer.appendChild(e.target) // Maybe come back and conCat
            e.target.className = 'selected';
            inputContainer.className = "stateInputContainer";
            selectedContainer.className = "selectedContainer selectedContainerFull";
            selected=false;
            toggleSelectedElement();
            addRemoveButton();
            clearResults();
            stateInput.value = '';
            toggleClearInputButtonVisibility();
        })
    } else {
        results = false;
    };
};

// Allows you to enter selected element without mouse
document.addEventListener("keyup", (e) => {
    e.preventDefault();
    if(e.key ==="Enter" && selected){
        selectedContainer.firstChild.focus();
    }else if(e.key ==="Backspace" && document.activeElement === selectedContainer.firstChild){
        clearSelected();
        stateInput.focus();
    }else if(e.key === "Enter" && document.activeElement !== stateInput){
        stateInput.focus();
    }
})

// Fixes 
form.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

// Main event listener, allows up to search, and traverse the results with up and down arrows
// While accounting for edge cases so the component doesn't break from unusual user behavior
form.addEventListener("keyup", (e) => {
    toggleLastChild();
    console.log(stateInput.value.length)
    if((e.key === "ArrowDown" || e.key === "Enter") && document.activeElement === stateInput && results) {
        e.preventDefault();
        focusFirstChild();
    }else if(e.key === "ArrowDown" && document.activeElement === stateInput && !results) {
        e.preventDefault();
    }else if(e.key ==="ArrowDown" && !lastChildFocused) {
        focusNextChild();
        e.preventDefault();
    }else if(e.key ==="ArrowDown" && lastChildFocused){
        focusFirstChild();
    }
    else if(e.key ==="ArrowUp" && document.activeElement !== resultsContainer.firstChild){ 
        focusPrevChild();
    }else if(e.key === "ArrowUp" && document.activeElement === resultsContainer.firstChild){
        focusLastChild();
    }else if(e.key === "ArrowUp" && document.activeElement === stateInput) {
        stateInput.focus();
    }else if((e.key === "ArrowLeft" || e.key === "ArrowRight") && document.activeElement === stateInput) {
        e.preventDefault();
    }else if(e.key === 'Escape'){
        console.log("escape")
        stateInput.focus();
    }else if(document.activeElement !== stateInput) {
        e.preventDefault();
    }else {
        clearResults();
        getStates();
    };
    toggleSelectedElement();
});

// Prevent's page reload if user submits input
form.addEventListener("submit", (e) => {
    e.preventDefault(); 
});

// clears the input when clear search bar button is clicked.
clearStateInputButton.addEventListener("click", () => {
    stateInput.value = '';
    toggleClearInputButtonVisibility();
    clearResults();
    inputContainer.className = "stateInputContainer";
});

