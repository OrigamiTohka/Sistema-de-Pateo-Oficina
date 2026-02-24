let veiculos = [];

// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyBbAI1SzsOy-Xkm5ihkzaY2Uie3s4u_LVQ",
    authDomain: "sistema-patio-oficina.firebaseapp.com",
    projectId: "sistema-patio-oficina"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// 🔄 TEMPO REAL
window.onload = function () {
    onSnapshot(collection(db, "veiculos"), snapshot => {
        veiculos = [];
        document.getElementById("listaVeiculos").innerHTML = "";

        snapshot.forEach(docSnap => {
            veiculos.push({ id: docSnap.id, ...docSnap.data() });
        });

        filtrarPorCliente();
        atualizarFiltroClientes();
    });
};

// ➕ ADICIONAR VEÍCULO
window.adicionarVeiculo = async function () {
    const cliente = document.getElementById("cliente").value;
    const modelo = document.getElementById("modelo").value;
    const placa = document.getElementById("placa").value.toUpperCase();
    const status = document.getElementById("status").value;

    if (!cliente || !modelo || !placa) {
        alert("Preencha todos os campos!");
        return;
    }

    await addDoc(collection(db, "veiculos"), {
        cliente,
        modelo,
        placa,
        status,
        dataEntrada: new Date().toISOString().split("T")[0],
        dataFinalizacao: ""
    });

    document.getElementById("cliente").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("placa").value = "";
};

// 🖥️ RENDERIZAR
function renderizarVeiculo(veiculo) {
    const lista = document.getElementById("listaVeiculos");

    const linha = document.createElement("tr");
    linha.innerHTML = `
        <td>${veiculo.cliente}</td>
        <td>${veiculo.modelo || "-"}</td>
        <td>${veiculo.placa}</td>
        <td>
            <select onchange="mudarStatus('${veiculo.id}', this.value)">
                ${["Aguardando Orçamento","Aguardando Autorização","Aguardando Peça","Em Serviço","Finalizado"]
                    .map(s => `<option value="${s}" ${s === veiculo.status ? "selected" : ""}>${s}</option>`)
                    .join("")}
            </select>
        </td>
        <td>
            <input type="date" value="${veiculo.dataEntrada}"
                onchange="mudarDataEntrada('${veiculo.id}', this.value)">
        </td>
        <td>${veiculo.dataFinalizacao || "-"}</td>
        <td><button onclick="removerVeiculo('${veiculo.id}')">Remover</button></td>
    `;

    aplicarCorStatus(linha, veiculo.status);
    lista.appendChild(linha);
}

// 🔁 STATUS
window.mudarStatus = async function (id, status) {
    await updateDoc(doc(db, "veiculos", id), {
        status,
        dataFinalizacao: status === "Finalizado"
            ? new Date().toISOString().split("T")[0]
            : ""
    });
};

// 📅 DATA ENTRADA
window.mudarDataEntrada = async function (id, data) {
    await updateDoc(doc(db, "veiculos", id), {
        dataEntrada: data
    });
};

// ❌ REMOVER
window.removerVeiculo = async function (id) {
    if (confirm("Deseja remover este veículo?")) {
        await deleteDoc(doc(db, "veiculos", id));
    }
};

// 🔍 FILTRO
window.filtrarPorCliente = function () {
    const filtroCliente = document.getElementById("filtroCliente").value;

    const inputPlaca = document.getElementById("pesquisaPlaca");
    const pesquisaPlaca = inputPlaca
        ? inputPlaca.value.toUpperCase()
        : "";

    const lista = document.getElementById("listaVeiculos");
    lista.innerHTML = "";

    veiculos
        // 📅 MAIS ANTIGO → MAIS RECENTE
        .sort((a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada))

        // 🔍 FILTROS
        .filter(v =>
            (filtroCliente === "Todos" || v.cliente === filtroCliente) &&
            (pesquisaPlaca === "" || v.placa.includes(pesquisaPlaca))
        )

        // 🖥️ RENDERIZA
        .forEach(renderizarVeiculo);
};

// 🔍 PESQUISAR POR PLACA
window.pesquisarPorPlaca = function () {
    const texto = document.getElementById("pesquisaPlaca").value
        .toUpperCase()
        .trim();

    const lista = document.getElementById("listaVeiculos");
    lista.innerHTML = "";

    veiculos
        .filter(v => v.placa.toUpperCase().includes(texto))
        .sort((a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada))
        .forEach(v => renderizarVeiculo(v));
};

// 🔄 ATUALIZAR FILTRO
function atualizarFiltroClientes() {
    const select = document.getElementById("filtroCliente");
    select.innerHTML = `<option value="Todos">Todos</option>`;

    [...new Set(veiculos.map(v => v.cliente))].forEach(cliente => {
        const opt = document.createElement("option");
        opt.value = cliente;
        opt.textContent = cliente;
        select.appendChild(opt);
    });
}

// 🎨 CORES
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

// 🚪 LOGOUT
window.logout = function () {
    signOut(auth).then(() => location.href = "login.html");
};