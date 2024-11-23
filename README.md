# Karaoke Social Sharing Platform

Uma plataforma de karaokê colaborativa em tempo real com suporte multi-dispositivo e recursos de interação social.

## 🚀 Funcionalidades

- Sessões de karaokê em tempo real
- Gerenciamento de fila de músicas
- Suporte multi-dispositivo
- Interação social entre usuários
- Interface moderna e responsiva

## 🛠️ Tecnologias Utilizadas

### Frontend
- React
- Socket.IO Client
- Material-UI (MUI)
- React Router DOM

### Backend
- Express.js
- Socket.IO
- CORS
- QRCode
- NanoID

## 🏗️ Estrutura do Projeto

```
karaoke-app/
├── frontend/         # Aplicação React
├── backend/          # Servidor Express
```

## 🔧 Configuração do Ambiente de Desenvolvimento

1. Clone o repositório:
```bash
git clone https://github.com/flaviokosta79/karaoke-app.git
cd karaoke-app
```

2. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

3. Instale as dependências do backend:
```bash
cd ../backend
npm install
```

4. Inicie o servidor de desenvolvimento:

Backend (porta 5000):
```bash
cd backend
npm start
```

Frontend (porta 3000):
```bash
cd frontend
npm start
```

## 🎯 Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Desenvolver sistema de hospedagem de áudio/vídeo na nuvem
- [ ] Criar versões para aplicativos móveis nativos
- [ ] Expandir tratamento de erros
- [ ] Adicionar armazenamento persistente
- [ ] Desenvolver sistema avançado de pontuação de karaokê

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).
