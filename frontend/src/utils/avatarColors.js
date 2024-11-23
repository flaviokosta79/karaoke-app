// Array de cores para os avatares
export const avatarColors = [
  '#1976d2', // Azul
  '#2e7d32', // Verde
  '#d32f2f', // Vermelho
  '#ed6c02', // Laranja
  '#9c27b0', // Roxo
  '#0288d1', // Azul claro
  '#689f38', // Verde claro
  '#f57c00', // Laranja escuro
  '#c2185b', // Rosa
  '#7b1fa2', // Roxo escuro
];

// Função para gerar uma cor consistente para cada usuário
export const getUserColor = (name) => {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[index % avatarColors.length];
};
