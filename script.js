let veiculos = [];

// 🔹 Carregar ao iniciar a página
window.onload = function () {
    const dadosSalvos = localStorage.getItem("patioOficina");

    if (dadosSalvos) {
        veiculos = JSON.parse(dadosSalvos);
        veiculos.forEach(veiculo => renderizarVeiculo(veiculo));
    }
};

// 🔹 Adicionar veículo
function adicionarVeiculo() {

    const cliente = document.getElementById("cliente").value;
    const placa = document.getElementById("placa").value.toUpperCase();
    const status = document.getElementById("status").value;

    if (cliente === "" || placa === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const novoVeiculo = {
        id: Date.now(),
        cliente,
        placa,
        status,
        dataEntrada: new Date().toISOString().split("T")[0],
        dataFinalizacao: ""
    };

    veiculos.push(novoVeiculo);
    salvarLocalStorage();
    renderizarVeiculo(novoVeiculo);

    document.getElementById("cliente").value = "";
    document.getElementById("placa").value = "";
}

// 🔹 Renderizar veículo na tabela
function renderizarVeiculo(veiculo) {

    const lista = document.getElementById("listaVeiculos");

    const linha = document.createElement("tr");
    linha.setAttribute("data-id", veiculo.id);

    linha.innerHTML = `
        <td>${veiculo.cliente}</td>
        <td>${veiculo.placa}</td>
        <td>
            <select onchange="mudarStatus(${veiculo.id}, this.value)">
                <option value="Aguardando Orçamento" ${veiculo.status === "Aguardando Orçamento" ? "selected" : ""}>Aguardando Orçamento</option>
                <option value="Aguardando Autorização" ${veiculo.status === "Aguardando Autorização" ? "selected" : ""}>Aguardando Autorização</option>
                <option value="Aguardando Peça" ${veiculo.status === "Aguardando Peça" ? "selected" : ""}>Aguardando Peça</option>
                <option value="Em Serviço" ${veiculo.status === "Em Serviço" ? "selected" : ""}>Em Serviço</option>
                <option value="Finalizado" ${veiculo.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
            </select>
        </td>

        <td><input type="date" value="${veiculo.dataEntrada}" onchange="mudarDataEntrada(${veiculo.id}, this.value)"></td>

        <td class="finalizacao">${veiculo.dataFinalizacao || "-"}</td>

        <td><button onclick="removerVeiculo(${veiculo.id})">Remover</button></td>

    `;

    aplicarCorStatus(linha, veiculo.status);
    lista.appendChild(linha);
}

// 🔹 Mudar status
function mudarStatus(id, novoStatus) {

    const veiculo = veiculos.find(v => v.id === id);
    veiculo.status = novoStatus;

    if (novoStatus === "Finalizado") {
        veiculo.dataFinalizacao = new Date().toISOString().split("T")[0];
    } else {
        veiculo.dataFinalizacao = "";
    }

    salvarLocalStorage();

    const linha = document.querySelector(`tr[data-id='${id}']`);
    aplicarCorStatus(linha, novoStatus);

    linha.querySelector(".finalizacao").innerText = veiculo.dataFinalizacao || "-";

}

// 🔹 Aplicar cor conforme status
function aplicarCorStatus(linha, status) {

    if (status === "Finalizado") {
        linha.style.backgroundColor = "#145a32";
    } else if (status === "Aguardando Orçamento") {
        linha.style.backgroundColor = "#ff0000";
    } else if (status === "Aguardando Autorização") {
        linha.style.backgroundColor = "#163e58";
    } else if (status === "Aguardando Peça") {
        linha.style.backgroundColor = "#00d9ff";
    } else if (status === "Em Serviço") {
        linha.style.backgroundColor = "#7d6608";
    } else {
        linha.style.backgroundColor = "transparent";
    }
}

// 🔹 Remover veículo
function removerVeiculo(id) {

    veiculos = veiculos.filter(v => v.id !== id);

    salvarLocalStorage();

    document.querySelector(`tr[data-id='${id}']`).remove();
}

// 🔹 Salvar no LocalStorage
function salvarLocalStorage() {
    localStorage.setItem("patioOficina", JSON.stringify(veiculos));
}