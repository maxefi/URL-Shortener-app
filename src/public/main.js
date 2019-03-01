const form = document.querySelector('.url-form');
const result = document.querySelector('.result-section');
const input = document.querySelector('.url-input');

form.addEventListener('submit', event => {
  event.preventDefault();

  fetch('/new', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: input.value,
    }),
  }).then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }

    return response.json();
  }).then(data => {
    while (result.hasChildNodes()) {
      result.removeChild(result.lastChild);
    }

    result.insertAdjacentHTML('afterbegin', `
      <div class='result'>
        <a target='_blank' class='short-url' rel='noopener' href='/${data.short_id}EXTERNAL_FRAGMENT'>
           ${location.origin}/${data.short_id}
        </a>
      </div>
    `);
  }).catch(console.error);
});
