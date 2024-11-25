# Karaoke Social Sharing Platform

Uma plataforma de karaokê colaborativa em tempo real com suporte multi-dispositivo e recursos de interação social.

## 🚀 Funcionalidades

- Sessões de karaokê em tempo real
- Gerenciamento de fila de músicas com drag-and-drop
- Suporte multi-dispositivo
- Interação social entre usuários
- Interface moderna e responsiva
- Busca integrada com YouTube
- Sistema de QR Code para conexão rápida

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- Material-UI (MUI) v5
- Socket.IO Client
- DND Kit para drag-and-drop
- TailwindCSS com @tailwindcss/forms
- React Router DOM
- React Toastify
- Lucide React para ícones
- Google APIs para integração com YouTube

### Backend
- Express.js
- Socket.IO
- CORS
- QRCode
- NanoID
- Google APIs

## 🏗️ Estrutura do Projeto

```
karaoke-app/
├── frontend/         # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços e APIs
│   │   └── styles/        # Estilos e configurações CSS
│   └── config-overrides.js # Configurações do webpack
└── backend/          # Servidor Express
    └── services/     # Serviços do backend
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
yarn install
```

3. Instale as dependências do backend:
```bash
cd ../backend
npm install
```

4. Configure as variáveis de ambiente:
- Frontend: Crie um arquivo `.env` na pasta frontend com:
  ```
  REACT_APP_BACKEND_URL=http://localhost:5000
  ```
- Backend: Crie um arquivo `.env` na pasta backend com suas credenciais do Google API

5. Inicie o servidor de desenvolvimento:

Backend:
```bash
npm run dev
```

Frontend:
```bash
yarn start
```

## 🔒 Segurança

O projeto utiliza as versões mais recentes e seguras das dependências, com auditorias regulares de segurança. Algumas medidas implementadas:

- Uso de CORS configurado adequadamente
- Sanitização de inputs
- Validação de dados no servidor
- Dependências atualizadas e sem vulnerabilidades conhecidas

## 🚀 Otimizações

O projeto inclui várias otimizações para melhor performance:

- Code splitting
- Compressão Gzip
- Remoção de código morto em produção
- Otimização de imagens
- Cache eficiente

## 📝 Scripts Disponíveis

Frontend:
- `yarn start`: Inicia o servidor de desenvolvimento
- `yarn build`: Cria a build de produção
- `yarn analyze`: Analisa o tamanho do bundle

Backend:
- `npm run dev`: Inicia o servidor em modo desenvolvimento
- `npm start`: Inicia o servidor em modo produção

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
