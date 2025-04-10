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
    createdInstances.push({ nomeInstancia, telefone });
    

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
  
  // Verifica se a instância existe
  const instancia = createdInstances.find(i => i.nomeInstancia === nomeInstancia);
  if (!instancia) {
      showFeedback(`Instância "${nomeInstancia}" não encontrada!`, 'error');
      return; // Encerra a função se a instância não existir
  }

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
          if (data.qrcode && data.qrcode.pairingCode) {
              const codigoPareamento = data.qrcode.pairingCode;
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
    const instancia = createdInstances.find(i => i.nomeInstancia === nomeInstancia);
    if (instancia) {
        createdGroups.push({ nomeGrupo, descricao, participantes });
        showFeedback(`Grupo "${nomeGrupo}" criado na instância "${nomeInstancia}"!`, 'success');
    } else {
        showFeedback(`Instância "${nomeInstancia}" não encontrada!`, 'error');
    }
}

// Desconectar Instância
function desconectarInstancia

// Deletar Instância
function deletarInstancia(data) {
    const { nomeInstancia } = data;
    createdInstances = createdInstances.filter(i => i.nomeInstancia !== nomeInstancia);
    showFeedback(`Instância "${nomeInstancia}" deletada com sucesso!`, 'success');
}

// Printar Instâncias
function printarInstancias() {
    resultsContainer.innerHTML = createdInstances.map(inst => `
        <div>Instância: ${inst.nomeInstancia}, Telefone: ${inst.telefone}</div>
    `).join('');
    showFeedback('Instâncias listadas abaixo.', 'success');
}

// Printar Link de Convite
function printarLinkConvite() {
    const linkAleatorio = `https://wa.me/${Math.random().toString(36).substr(2, 8)}`;
    showFeedback(`Link de convite gerado: ${linkAleatorio}`, 'success');
}

// Printar Info do Grupo
function printarInfoGrupo() {
    resultsContainer.innerHTML = createdGroups.map(grupo => `
        <div>Grupo: ${grupo.nomeGrupo}, Descrição: ${grupo.descricao}, Participantes: ${grupo.participantes}</div>
    `).join('');
    showFeedback('Informações dos grupos listadas abaixo.', 'success');
}

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

document.getElementById("deletar-instancia").addEventListener("click", () => {
    openModal('Deletar Instância', [
        { label: 'Nome da Instância', id: 'nomeInstancia', type: 'text' }
    ], deletarInstancia);
});

document.getElementById("printar-instancia").addEventListener("click", printarInstancias);
document.getElementById("print-link-convite").addEventListener("click", printarLinkConvite);
document.getElementById("print-info-grupo").addEventListener("click", printarInfoGrupo);

// Fechar o Modal
cancelButton.addEventListener("click", closeModal);
closeModalButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
submitButton.addEventListener("click", handleSubmit);