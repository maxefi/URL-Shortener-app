const form = document.querySelector('.url-form');
const result = document.querySelector('.result-section');
const input = document.querySelector('.url-input');

form.addEventListener('submit', async event => {
  event.preventDefault();

  try {
    const response = await fetch('/new', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: input.value,
      }),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }

    const data = await response.json();

    while (result.hasChildNodes()) {
      result.removeChild(result.lastChild);
    }

    result.insertAdjacentHTML('afterbegin', `
      <div class='result'>
        <a target='_blank' class='short-url' rel='noopener' href='/${data.short_id}'>
           ${location.origin}/${data.short_id}
        </a>
      </div>
    `);
  } catch (err) {
    console.error(err);
  }
});
