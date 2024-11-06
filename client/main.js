import MarkdownIt from 'markdown-it';
// import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';


let form = document.querySelector('form');
// let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
    ev.preventDefault()
    output.textContent = "Generating...";

    let imageName = form.elements.namedItem('chosen-image').value;

    let payload = JSON.stringify(
    { 
        data: {
            //photoUrl: `${window.location.origin}/${imageName}`
            photoUrl: 'crash'
        }
    });

    var request = new XMLHttpRequest();
    request.open("POST", "http://localhost:3400/recipieFlow");
    request.setRequestHeader('Content-Type', 'application/json')
    request.onload = function (response) {
        // Read the response and interpret the output as markdown.
        let md = new MarkdownIt();

        response = JSON.parse(request.responseText).result;
        output.innerHTML = md.render(response.recipie);
    };
    request.send(payload);
    return false;
}