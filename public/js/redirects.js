const tableBody = document.getElementById("redirects-body");

function loadRedirects() {
    fetch(`/api/redirects`, {
        method: "GET"
    }).then(res => res.json()).then(data => {
        data.sort((a, b) => a.path.localeCompare(b.path));

        data.forEach(redirect => {
            let row = tableBody.insertRow(-1);

            let c1 = row.insertCell(0);
            let c2 = row.insertCell(1);
            let c3 = row.insertCell(2);

            c1.classList = "px-4 py-2 outline outline-1 outline-gray-700";
            c2.classList = "px-4 py-2 outline outline-1 outline-gray-700";
            c3.classList = "px-4 py-2 outline outline-1 outline-gray-700 text-center";

            const icon = {
                false: "fa-solid fa-x text-red-600",
                true: "fa-solid fa-check text-green-600"
            }

            c1.innerHTML = `<a href="/${redirect.path}" class="font-semibold text-blue-600 hover:text-blue-700">/${redirect.path}</a>`;
            c2.innerHTML = `<a href="${redirect.redirect}" class="text-gray-400 underline underline-2 hover:no-underline">${redirect.redirect}</a>`;
            c3.innerHTML = `<i class="${icon[redirect.redirect_path]}"></i>`;
        })
    })
}

loadRedirects();