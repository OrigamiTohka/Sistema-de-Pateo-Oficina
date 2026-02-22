import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbAI1SzsOy-Xkm5ihkzaY2Uie3s4u_LVQ",
    authDomain: "sistema-patio-oficina.firebaseapp.com",
    projectId: "istema-patio-oficina"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = function () {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erro");

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            window.location.href = "index.html"; // página do sistema
        })
        .catch(() => {
            erro.innerText = "E-mail ou senha inválidos";
        });
};