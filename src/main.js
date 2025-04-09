import { MY_API_KEY } from './config.js';


document.getElementById("criar-instancia").addEventListener("click", criarInstancia);
document.getElementById("conectar-instancia").addEventListener("click", conectarInstancia);
document.getElementById("criar-grupo").addEventListener("click", criarGrupo);
document.getElementById("deletar-instancia").addEventListener("click", deletarInstancia);
document.getElementById("printar-instancia").addEventListener("click", fetchInstancias);
document.getElementById("print-link-convite").addEventListener("click", codigoConvite);
document.getElementById("print-info-grupo").addEventListener("click", fetchGrupo);

// Função para Criar uma Instância no Manager

async function criarInstancia() {
  const options = {
      method: 'POST',
      headers: {
        apikey: MY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ // Use JSON.stringify to serialize the object into a JSON string
          instanceName: "exemplo",
          qrcode: true,
          number: "5514981826224",
          integration: "WHATSAPP-BAILEYS"
      })
    };
    
    fetch('http://localhost:8080/instance/create', options)
      .then(response => { return response.json()})
      .then(response => console.log(response))
      .catch(err => console.error(err));
}

// Função para Conectar o Whatsapp na Instância criada

function conectarInstancia(){
    const options1 = {method: 'GET', headers: {apikey: '4c3901cf-458c-41e1-9439-2e6055c7a5be'}};

    fetch('http://localhost:8080/instance/connect/exemplo', options1)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));
}

// Apagar a conexão do whats

function deletarInstancia(){
  const options = {method: 'DELETE', headers: {apikey: '4c3901cf-458c-41e1-9439-2e6055c7a5be'}};

  fetch('http://localhost:8080/instance/delete/exemplo', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}

// pra pegar informações das instancias

function fetchInstancias(){
    const options3 = {method: 'GET', headers: {apikey: '4c3901cf-458c-41e1-9439-2e6055c7a5be'}};

    fetch('http://localhost:8080/instance/fetchInstances', options3)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

// Função para criar grupo do Whatsapp a partir da Instância

function criarGrupo(){
    const options5 = {
        method: 'POST',
        headers: {
          apikey: '4c3901cf-458c-41e1-9439-2e6055c7a5be',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject: "teste da API", 
            description: "gfesgfsdgdsf",
            participants: ["5514996090039"]
        })
      };
      
      fetch('http://localhost:8080/group/create/exemplo', options5)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

// Função pra mostrar o código de convite do grupo

function codigoConvite(){
  const options = {method: 'GET', headers: {apikey: '4c3901cf-458c-41e1-9439-2e6055c7a5be'}};

  fetch('http://localhost:8080/group/inviteCode/exemplo?groupJid=120363401307572585', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}

function fetchGrupo(){
  const options = {method: 'GET', headers: {apikey: '4c3901cf-458c-41e1-9439-2e6055c7a5be'}};

  fetch('http://localhost:8080/group/findGroupInfos/exemplo?groupJid=120363401307572585', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}