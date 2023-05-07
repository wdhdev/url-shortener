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

            const redirect_path = {
                false: "False",
                true: "True"
            }

            c1.innerHTML = `<a href="/${redirect.path}">/${redirect.path}</a>`;
            c1.setAttribute("data-column", "path");

            c2.innerHTML = `<a href="${redirect.redirect}">${redirect.redirect}</a>`;
            c2.setAttribute("data-column", "redirect");

            c3.innerText = redirect_path[redirect.redirect_path];
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