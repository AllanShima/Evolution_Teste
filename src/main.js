import { MY_API_KEY } from './config.js';

const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const cancelButton = document.getElementById('cancel-button');
const submitButton = document.getElementById('submit-button');
const closeModalButton = document.getElementById('close-modal');
const feedback = document.getElementById('feedback');
const resultsContainer = document.getElementById('results-container');

let currentAction = null;

let createdInstances = [];
let createdGroups = [];

// Função para abrir o modal
function openModal(title, fields, action) {
    modalTitle.textContent = title;
    modalBody.innerHTML = fields
        .map(field => `
            <label>${field.label}</label>
            <input type="${field.type}" id="${field.id}" />
        `)
        .join('');
    currentAction = action;
    modal.classList.add('visible');
    overlay.classList.add('visible');
}

// Fechar o modal
function closeModal() {
    modal.classList.remove('visible');
    overlay.classList.remove('visible');
}

// Mostrar feedback
function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = type === 'success' ? 'success' : 'error';
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

// Capturar dados do modal e executar ação
function handleSubmit() {
    const inputs = modalBody.querySelectorAll('input');
    const data = {};
    inputs.forEach(input => {
        data[input.id] = input.value;
    });
    if (currentAction) currentAction(data);
    closeModal();
}

// --------------------------------------------------------------------------------------------------

// Funções para cada botão

// Criar Instância
function criarInstancia(data) {
    const { nomeInstancia, telefone } = data;

    // createdInstances.push({ nomeInstancia, telefone });

    const options = {
      method: 'POST',
      headers: {
        apikey: MY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ // Use JSON.stringify to serialize the object into a JSON string
          instanceName: nomeInstancia,
          qrcode: true,
          number: telefone,
          integration: "WHATSAPP-BAILEYS"
      })
    };
    
    fetch('http://localhost:8080/instance/create', options)
      .then(response => response.json())
      .then(response => {
        console.log(response)
        showFeedback(`Instância "${nomeInstancia}" criada com sucesso!`, 'success')
      })
      .catch(err => console.error(err));
}

// Conectar Instância
function conectarInstancia(data) {
  const { nomeInstancia } = data;

  // console.log(createdInstances);
  // // Verifica se a instância existe
  // const instancia = createdInstances.find(i => i.nomeInstancia === nomeInstancia);
  // if (!instancia) {
  //     showFeedback(`Instância "${nomeInstancia}" não encontrada!`, 'error');
  //     return; // Encerra a função se a instância não existir
  // }

  showFeedback(`Conectando à instância "${nomeInstancia}"...`, 'success');

  const options = {
      method: 'GET',
      headers: { apikey: MY_API_KEY }
  };

  // Usa a variável nomeInstancia na URL
  fetch(`http://localhost:8080/instance/connect/${nomeInstancia}`, options)
      .then(response => {
          if (!response.ok) {
              throw new Error('Erro na conexão com a API');
          }
          return response.json();
      })
      .then(data => {
          // Verifica se existe pairingCode na resposta
          if (data.pairingCode) {
              const codigoPareamento = data.pairingCode;
              alert(`Código de Pareamento: ${codigoPareamento}`);
          } else {
              throw new Error('Código de pareamento não encontrado na resposta');
          }
      })
      .catch(err => {
          console.error('Erro:', err);
          showFeedback(`Falha ao conectar à instância: ${err.message}`, 'error');
      });
}

// Criar Grupo
function criarGrupo(data) {
    const { nomeInstancia, nomeGrupo, descricao, participantes } = data;

    // const instancia = createdInstances.find(i => i.nomeInstancia === nomeInstancia);
    // if (instancia) {
    //     createdGroups.push({ nomeGrupo, descricao, participantes });
    //     showFeedback(`Grupo "${nomeGrupo}" criado na instância "${nomeInstancia}"!`, 'success');
    // } else {
    //     showFeedback(`Instância "${nomeInstancia}" não encontrada!`, 'error');
    // }

    console.log(participantes);

    const options = {
      method: 'POST',
      headers: {
        apikey: MY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          subject: nomeGrupo, 
          description: descricao,
          participants: [participantes]
      })
    };
    
    fetch(`http://localhost:8080/group/create/${nomeInstancia}`, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

}

// Desconectar Instância

function desconectarInstancia(data) {
  const { nomeInstancia } = data;

  const options = {method: 'DELETE', headers: {apikey: MY_API_KEY}};

  fetch(`http://localhost:8080/instance/logout/${nomeInstancia}`, options)
    .then(response => response.json())
    .then(data => console.log(data.response))
    .catch(err => console.error(err));
}

// Deletar Instância
function deletarInstancia(data) {
    const { nomeInstancia } = data;

    // createdInstances = createdInstances.filter(i => i.nomeInstancia !== nomeInstancia);
    // showFeedback(`Instância "${nomeInstancia}" deletada com sucesso!`, 'success');

    const options = {method: 'DELETE', headers: {apikey: MY_API_KEY}};

    fetch(`http://localhost:8080/instance/delete/${nomeInstancia}`, options)
      .then(response => response.json())
      .then(data => console.log(data.response))
      .catch(err => console.error(err));
}

// Printar Instâncias
function printarInstancias() {
  const options = {method: 'GET', headers: {apikey: MY_API_KEY}};

  fetch('http://localhost:8080/instance/fetchInstances', options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

  // resultsContainer.innerHTML = createdInstances.map(inst => `
  //     <div>Instância: ${inst.nomeInstancia}, Telefone: ${inst.telefone}</div>
  // `).join('');
  // showFeedback('Instâncias listadas abaixo.', 'success');
}

// Printar Link de Convite
function printarLinkConvite(data) {

    // const linkAleatorio = `https://wa.me/${Math.random().toString(36).substr(2, 8)}`;

    const { nomeInstancia, grupoJID } = data;

    const options = {method: 'GET', headers: {apikey: MY_API_KEY}};

    fetch(`http://localhost:8080/group/inviteCode/${nomeInstancia}?groupJid=${grupoJID}`, options)
      .then(response => response.json())
      .then(data => {
        // Verifica se existe inviteUrl na resposta
        if (data.inviteUrl) {
            const urlConvite = data.inviteUrl;
            alert(`Link: ${urlConvite}`);
        } else {
            throw new Error('Link de Convite não encontrado.');
        }
    })
      .catch(err => {
        console.error(err);
        showFeedback(`Falha ao conectar à instância: ${err.message}`, 'error');
      });
}

// Printar Info do Grupo
function printarInfoGrupo(data) {

    // resultsContainer.innerHTML = createdGroups.map(grupo => `
    //     <div>Grupo: ${grupo.nomeGrupo}, Descrição: ${grupo.descricao}, Participantes: ${grupo.participantes}</div>
    // `).join('');
    // showFeedback('Informações dos grupos listadas abaixo.', 'success');

    const { nomeInstancia, grupoJID } = data;

    const options = {method: 'GET', headers: {apikey: MY_API_KEY}};

    fetch(`http://localhost:8080/group/findGroupInfos/${nomeInstancia}?groupJid=${grupoJID}`, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));
}

// ----------------------------------------------------------------------------------------------------------------------

// Eventos de Botões
document.getElementById("criar-instancia").addEventListener("click", () => {
    openModal('Criar Instância', [
        { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' },
        { label: 'Telefone', id: 'telefone', type: 'text' }
    ], criarInstancia);
});

document.getElementById("conectar-instancia").addEventListener("click", () => {
    openModal('Conectar Instância', [
        { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' },
    ], conectarInstancia);
});

document.getElementById("criar-grupo").addEventListener("click", () => {
    openModal('Criar Grupo', [
        { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' },
        { label: 'Nome do Grupo', id: 'nomeGrupo', type: 'text' },
        { label: 'Descrição', id: 'descricao', type: 'text' },
        { label: 'Telefone dos Participantes', id: 'participantes', type: 'text' }
    ], criarGrupo);
});

document.getElementById("desconectar-instancia").addEventListener("click", () => {
  openModal('Desconectar Instância', [
      { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' }
  ], desconectarInstancia);
});

document.getElementById("deletar-instancia").addEventListener("click", () => {
    openModal('Deletar Instância', [
        { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' }
    ], deletarInstancia);
});

document.getElementById("printar-instancia").addEventListener("click", printarInstancias);

document.getElementById("print-link-convite").addEventListener("click", () => {
  openModal('Gerar Link de Convite', [
      { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' },
      { label: 'ID do grupo', id: 'grupoJID', type: 'text' }
  ], printarLinkConvite);
});

document.getElementById("print-info-grupo").addEventListener("click", () => {
  openModal('Gerar Informações do Grupo', [
      { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' },
      { label: 'ID do grupo', id: 'grupoJID', type: 'text' }
  ], printarInfoGrupo);
});

// Fechar o Modal
cancelButton.addEventListener("click", closeModal);
closeModalButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
submitButton.addEventListener("click", handleSubmit);