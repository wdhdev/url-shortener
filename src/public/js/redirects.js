const table = document.getElementById("redirects");
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
            c3.classList = "px-4 py-2 outline outline-1 outline-gray-700";

            const redirect_path = {
                false: "No",
                true: "Yes"
            }

            const redirect_path_colour = {
                false: "text-red-600",
                true: "text-green-600"
            }

            c1.innerHTML = `<a href="/${redirect.path}" class="font-semibold text-blue-600 hover:text-blue-700">/${redirect.path}</a>`;
            c1.setAttribute("data-column", "path");

            c2.innerHTML = `<a href="${redirect.redirect}" class="text-gray-400 underline underline-2 hover:no-underline">${redirect.redirect}</a>`;
            c2.setAttribute("data-column", "redirect");

            c3.innerHTML = `<span class="${redirect_path_colour[redirect.redirect_path]}">${redirect_path[redirect.redirect_path]}</span>`;
            c3.setAttribute("data-column", "redirect-path");
        })
    })
}

function sortTable() {
    const headers = table.querySelectorAll("th[data-sort]");
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    headers.forEach((header) => {
        header.addEventListener("click", () => {
            const column = header.getAttribute("data-sort");
            const direction = header.classList.contains("asc") ? -1 : 1;

            rows.sort((a, b) => {
                const aValue = a.querySelector(`td[data-column="${column}"]`).textContent;
                const bValue = b.querySelector(`td[data-column="${column}"]`).textContent;
                return direction * aValue.localeCompare(bValue);
            });

            rows.forEach((row) => table.tBodies[0].appendChild(row));

            headers.forEach((h) => h.classList.remove("asc", "desc"));
            header.classList.toggle(direction === 1 ? "asc" : "desc");
        })
    })
}

loadRedirects();