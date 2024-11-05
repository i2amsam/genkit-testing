let form = document.querySelector('form');
let output = document.querySelector('.output');

let selectedImage = document.querySelector('.image-choice:has(:checked) img')

form.onsubmit = async (ev) => {
    ev.preventDefault()
    output.textContent = "Generating...";

    var form = new FormData(form);

    dataToSend = new FormData()
    payload = JSON.stringify(
    { 
        data: {
            photoUrl: "https://www.mercy.net/content/dam/mercy/en/images/orange-or-banana-20381.jpg"
        }
    });

    var request = new XMLHttpRequest();
    request.open("POST", "http://127.0.0.1:3400/recipieFlow");
    request.setRequestHeader('Content-Type', 'application/json')
    request.onload = function () {
        // Read the response and interpret the output as markdown.
        let md = window.markdownit();

        response = JSON.parse(request.responseText).result;
        output.innerHTML = md.render(response.recipie);
    };
    request.send(payload);
    return false;
}