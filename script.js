let veiculos = [];

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// MESMA CONFIG
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 PROTEÇÃO DO SISTEMA
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // NÃO LOGADO → VOLTA PARA LOGIN
        window.location.href = "login.html";
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
function adicionarVeiculo() {
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
function mudarStatus(id, status) {
    db.collection("veiculos").doc(id).update({
        status,
        dataFinalizacao: status === "Finalizado"
            ? new Date().toISOString().split("T")[0]
            : ""
    });
}

// 🔹 DATA ENTRADA
function mudarDataEntrada(id, data) {
    db.collection("veiculos").doc(id).update({
        dataEntrada: data
    });
}

// 🔹 REMOVER
function removerVeiculo(id) {
    if (confirm("Deseja remover este veículo?")) {
        db.collection("veiculos").doc(id).delete();
    }
}

// 🔹 FILTRO
function filtrarPorCliente() {
    const filtro = document.getElementById("filtroCliente").value;
    const lista = document.getElementById("listaVeiculos");
    lista.innerHTML = "";

    veiculos
        .filter(v => filtro === "Todos" || v.cliente === filtro)
        .forEach(v => renderizarVeiculo(v));
}

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