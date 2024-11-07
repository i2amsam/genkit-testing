let form = document.querySelector('form');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
    ev.preventDefault()
    output.textContent = "Generating...";
    const data = new FormData(form);
    await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
            image: data.get('chosenImage'),
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        return response.json();
    }).then(response => {
        let md = window.markdownit();
        output.innerHTML = md.render(response.recipe);
    });
    return false;
}