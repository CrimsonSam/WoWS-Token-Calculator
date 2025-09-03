const baseTokens = [25, 35, 50, 75, 100, 125];
const baseTiers = ["Tier 5", "Tier 6", "Tier 7", "Tier 8", "Tier 9", "Tier 10"];

document.addEventListener("DOMContentLoaded", () => {
    const tierGridBody = document.querySelector("#tierGrid tbody");
    baseTiers.forEach((tier, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${tier}</td>
            <td>${baseTokens[idx]}</td>
            <td><input type="number" value="0" min="0"></td>
            <td>0</td>
        `;
        tierGridBody.appendChild(tr);
    });

    // Boutons
    document.getElementById("btnLoadProfile").addEventListener("click", loadProfile);
    document.getElementById("btnReset").addEventListener("click", resetGrid);

    // Checkboxes et inputs déclenchent updateTotals
    document.querySelectorAll("#tierGrid input[type='number']").forEach(input => {
        input.addEventListener("input", updateTotals);
    });
    document.querySelectorAll(".flags input[type='checkbox']").forEach(cb => {
        cb.addEventListener("change", updateTotals);
    });

    updateTotals();
});

function getCurrentTierCounts() {
    const counts = {};
    const rows = document.querySelectorAll("#tierGrid tbody tr");
    rows.forEach(row => {
        const tier = row.children[0].textContent;
        const num = parseInt(row.children[2].children[0].value) || 0;
        counts[tier] = num;
    });
    return counts;
}

function updateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll("#tierGrid tbody tr");
    rows.forEach(row => {
        const tokens = parseInt(row.children[1].textContent) || 0;
        const ships = parseInt(row.children[2].children[0].value) || 0;
        const total = tokens * ships;
        row.children[3].textContent = total;
        subtotal += total;
    });

    let total = subtotal;
    if (document.getElementById("chkEventPass").checked) total += 2000;
    if (document.getElementById("chkFreeT6").checked) total += 35;
    if (document.getElementById("chkFreeT7").checked) total += 50;
    if (document.getElementById("chkOptioT7").checked) total += 50;
    if (document.getElementById("chkFreeT8").checked) total += 75;
    if (document.getElementById("chkFreeT10").checked) total += 125;
    if (document.getElementById("chkKushiro").checked) total += (125 - 10000);
    if (document.getElementById("chkTXBonus").checked) total -= 1500;
    if (total < 0) total = 0;

    document.getElementById("subTotalText").textContent = `Subtotal: ${subtotal}`;
    document.getElementById("totalText").textContent = `Total: ${total}`;
    document.getElementById("superContainersText").textContent = `Number of Supercontainers: ${Math.min(Math.floor(total/125), 130)}`;
    document.getElementById("remainText").textContent = `Remain: ${total % 125}`;
}

async function loadProfile() {
    const server = document.getElementById("server").value;
    const nickname = document.getElementById("nickname").value.trim();
    if (!nickname) return alert("Veuillez saisir un pseudo.");

    const lblStatus = document.getElementById("lblStatus");
    lblStatus.textContent = "Chargement...";

    try {
        const response = await fetch(`proxy.php?server=${server}&nickname=${encodeURIComponent(nickname)}`);
        const data = await response.json();
        if (!data || !data.tiers) {
            lblStatus.textContent = "Aucun navire trouvé.";
            return;
        }

        // Remplir la grille
        const rows = document.querySelectorAll("#tierGrid tbody tr");
        rows.forEach(row => {
            const tier = row.children[0].textContent;
            row.children[2].children[0].value = data.tiers[tier] || 0;
        });

        updateTotals();
        lblStatus.textContent = `Profil chargé: ${nickname}`;
    } catch (err) {
        lblStatus.textContent = "Erreur: " + err;
    }
}

function resetGrid() {
    document.querySelectorAll("#tierGrid tbody input[type='number']").forEach(input => input.value = 0);
    document.querySelectorAll(".flags input[type='checkbox']").forEach(cb => cb.checked = false);
    updateTotals();
    document.getElementById("lblStatus").textContent = "";
}
