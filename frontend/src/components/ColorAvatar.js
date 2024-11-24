import React from 'react';

const colors = [
  { bg: 'bg-red-500', text: 'text-red-500', name: 'Vermelho' },
  { bg: 'bg-blue-500', text: 'text-blue-500', name: 'Azul' },
  { bg: 'bg-green-500', text: 'text-green-500', name: 'Verde' },
  { bg: 'bg-yellow-500', text: 'text-yellow-500', name: 'Amarelo' },
  { bg: 'bg-purple-500', text: 'text-purple-500', name: 'Roxo' },
  { bg: 'bg-pink-500', text: 'text-pink-500', name: 'Rosa' },
  { bg: 'bg-indigo-500', text: 'text-indigo-500', name: 'Índigo' },
  { bg: 'bg-orange-500', text: 'text-orange-500', name: 'Laranja' },
];

function ColorAvatar({ selected, color, onClick, initials }) {
  const isSelected = selected?.bg === color.bg;
  
  return (
    <button
      onClick={() => onClick(color)}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        ${color.bg} text-white font-semibold text-lg
        transition-transform hover:scale-110
        ${isSelected ? 'ring-4 ring-offset-2 ring-' + color.bg.replace('bg-', '') : ''}
      `}
      title={color.name}
    >
      {initials}
    </button>
  );
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export { colors };
export default ColorAvatar;
