import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ⚠️ MESMA CONFIG QUE VOCÊ JÁ USA
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO"
};

// Inicia o Firebase
const app = initializeApp(firebaseConfig);

// Ativa o sistema de login
const auth = getAuth(app);

// Essa função é chamada quando clica em "Entrar"
window.login = function () {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            // DEU CERTO → VAI PARA O SISTEMA
            window.location.href = "index.html";
        })
        .catch(() => {
            // DEU ERRO → MOSTRA MENSAGEM
            document.getElementById("erro").innerText =
                "E-mail ou senha inválidos";
        });
};