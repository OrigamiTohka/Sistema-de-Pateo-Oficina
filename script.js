
let veiculos = [];

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbAI1SzsOy-Xkm5ihkzaY2Uie3s4u_LVQ",
    authDomain: "sistema-patio-oficina.firebaseapp.com",
    projectId: "istema-patio-oficina"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 PROTEÇÃO DE ROTAS
onAuthStateChanged(auth, user => {
    const pagina = location.pathname;

    if (!user && !pagina.includes("login.html")) {
        location.href = "login.html";
    }

    if (user && pagina.includes("login.html")) {
        location.href = "index.html";
    }
});

// 🔹 CARREGAR EM TEMPO REAL
window.onload = function () {
    db.collection("veiculos").onSnapshot(snapshot => {
        veiculos = [];
        document.getElementById("listaVeiculos").innerHTML = "";

        snapshot.forEach(doc => {
            const veiculo = { id: doc.id, ...doc.data() };
            veiculos.push(veiculo);
        });

        filtrarPorCliente();
        atualizarFiltroClientes();
    });
};

// 🔹 ADICIONAR VEÍCULO
window.adicionarVeiculo = async function() {
    const cliente = document.getElementById("cliente").value;
    const placa = document.getElementById("placa").value.toUpperCase();
    const status = document.getElementById("status").value;

    if (!cliente || !placa) {
        alert("Preencha todos os campos!");
        return;
    }

    db.collection("veiculos").add({
        cliente,
        placa,
        status,
        dataEntrada: new Date().toISOString().split("T")[0],
        dataFinalizacao: ""
    });

    document.getElementById("cliente").value = "";
    document.getElementById("placa").value = "";
}

// 🔹 RENDERIZAR
function renderizarVeiculo(veiculo) {
    const lista = document.getElementById("listaVeiculos");

    const linha = document.createElement("tr");
    linha.setAttribute("data-id", veiculo.id);

     linha.innerHTML = `
        <td>${veiculo.cliente}</td>
        <td>${veiculo.placa}</td>
        <td>
            <select onchange="mudarStatus('${veiculo.id}', this.value)">
                ${["Aguardando Orçamento","Aguardando Autorização","Aguardando Peça","Em Serviço","Finalizado"]
                    .map(s => `<option value="${s}" ${s===veiculo.status?"selected":""}>${s}</option>`).join("")}
            </select>
        </td>
        <td>
            <input type="date" value="${veiculo.dataEntrada}"
            onchange="mudarDataEntrada('${veiculo.id}', this.value)">
        </td>
        <td class="finalizacao">${veiculo.dataFinalizacao || "-"}</td>
        <td class="acao">
            <button onclick="removerVeiculo('${veiculo.id}')">Remover</button>
        </td>
    `;

    aplicarCorStatus(linha, veiculo.status);
    lista.appendChild(linha);
}

// 🔹 STATUS
window.mudarStatus = async function (id, status) {
    db.collection("veiculos").doc(id).update({
        status,
        dataFinalizacao: status === "Finalizado"
            ? new Date().toISOString().split("T")[0]
            : ""
    });
}

// 🔹 DATA ENTRADA
window.mudarDataEntrada = async function (id, data) {
    db.collection("veiculos").doc(id).update({
        dataEntrada: data
    });
}

// 🔹 REMOVER
window.removerVeiculo = async function (id) {
    if (confirm("Deseja remover este veículo?")) {
        db.collection("veiculos").doc(id).delete();
    }
}

// 🔹 FILTRO
window.filtrarPorCliente = function () {
    const filtro = document.getElementById("filtroCliente").value;
    const lista = document.getElementById("listaVeiculos");
    lista.innerHTML = "";

    veiculos
        .filter(v => filtro === "Todos" || v.cliente === filtro)
        .forEach(v => renderizarVeiculo(v));
}

// 🔹 ATUALIZAR FILTRO
function atualizarFiltroClientes() {
    const select = document.getElementById("filtroCliente");
    select.innerHTML = `<option value="Todos">Todas</option>`;

    [...new Set(veiculos.map(v => v.cliente))].forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente;
        option.textContent = cliente;
        select.appendChild(option);
    });
}

// 🔹 CORES
function aplicarCorStatus(linha, status) {
    const cores = {
        "Finalizado": "#145a32",
        "Aguardando Orçamento": "#ff0000",
        "Aguardando Autorização": "#163e58",
        "Aguardando Peça": "#00d9ff",
        "Em Serviço": "#7d6608"
    };
    linha.style.backgroundColor = cores[status] || "transparent";
}

window.logout = function () {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
};