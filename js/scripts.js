/*!
* Start Bootstrap - Bare v5.0.7 (https://startbootstrap.com/template/bare)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

$( document ).ready(function() {
        var getParentAnchor = function (element) {
        while (element !== null) {
        if (element.ariaLabel && element.tagName.toUpperCase() === "A") {
            return element;
        }
        element = element.parentNode;
        }
        return null;
    };
    
    document.querySelector("body").addEventListener('click', function(e) {
        e.preventDefault();
        var anchor = getParentAnchor(e.target);
        
        if(anchor !== null) {

            const existingElements = document.querySelectorAll(".lMenu");
            const elmSel = Array.from(existingElements).filter(chapter => chapter.classList.contains("active"))

            elmSel[0].classList.remove("active")
            anchor.classList.add("active");
            pages(anchor.ariaLabel)
        }
    }, false);
});

let pages = (page) => {
    $('#main').load('/pages/'+page+'.html');
}
