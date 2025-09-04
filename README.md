# 🎮 Sand Tetris - Jogo Online Gratuito

[![Deploy Status](https://img.shields.io/badge/Deploy-Ready-brightgreen)](https://sandtetris.io)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**🎯 Jogue agora:** [sandtetris.io](https://sandtetris.io)

Um jogo de Tetris com física de areia inovadora, construído com Next.js 15, React 19 e TypeScript. Jogue online gratuitamente em qualquer dispositivo!

## ✨ Características Principais

- **🎮 Física de Areia Realista**: As peças se desintegram em grãos de areia que caem naturalmente
- **🧹 Limpeza Inteligente**: Linhas monocromáticas e pontes são limpas automaticamente
- **⚡ Performance Otimizada**: Game loop ultra otimizado para 60 FPS suaves
- **🎨 Design Moderno**: Interface elegante com animações CSS e tema escuro
- **📱 Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **🎯 Controles Intuitivos**: Teclado, mouse e touch suportados
- **🌐 PWA Ready**: Instalável como aplicativo nativo
- **♿ Acessível**: Suporte completo para leitores de tela

## 🎮 Como Jogar

### 🎹 Controles

- **A/D**: Mover peça para esquerda/direita
- **W**: Rotacionar 90° no sentido horário
- **S**: Rotacionar 180°
- **Espaço**: Queda rápida (fast drop)
- **P**: Pausar/despausar
- **R**: Reiniciar jogo

### 🎯 Mecânicas Únicas

- **Desintegração**: Peças se quebram em areia ao tocar a superfície
- **Limpeza de Linhas**: Linhas da mesma cor são limpas automaticamente
- **Pontes**: Areia conectada de uma borda à outra é removida
- **Pontuação**: Pontos por linhas e pontes limpas
- **Níveis**: Velocidade aumenta conforme o score
- **Combo System**: Multiplicadores de pontuação

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de UI moderna
- **TypeScript** - Tipagem estática para melhor desenvolvimento
- **Tailwind CSS 4** - Framework CSS utilitário
- **Framer Motion** - Animações fluidas e performáticas
- **Canvas API** - Renderização 2D otimizada
- **PWA** - Progressive Web App capabilities

## 🏗️ Arquitetura

```
src/
├── app/                 # App Router do Next.js
│   ├── layout.tsx      # Layout principal com SEO
│   ├── page.tsx        # Página do jogo
│   └── globals.css     # Estilos globais
├── components/         # Componentes React
│   ├── GameCanvas.tsx  # Canvas do jogo
│   ├── GameControls.tsx # Controles do jogo
│   └── MobileControls.tsx # Controles mobile
└── hooks/             # Hooks customizados
    └── useGameLogic.ts # Lógica do jogo
```

## ⚡ Otimizações de Performance

### 🎯 Game Loop

- **60 FPS** garantidos com `requestAnimationFrame`
- **Throttling inteligente** para evitar sobrecarga
- **Cálculos otimizados** para física de areia
- **Renderização eficiente** com Canvas 2D

### 🧠 Memória

- **Garbage collection** otimizado
- **Referências estáveis** para evitar re-renders
- **Buffers de animação** para reduzir operações

### 🎨 CSS

- **Animações CSS** ao invés de JavaScript
- **Will-change** para otimização de GPU
- **Gradientes otimizados** para background

## 🎨 Design System

### 🎨 Cores

- **Primárias**: Tons de roxo (#a78bfa) e azul (#60a5fa)
- **Secundárias**: Verde (#34d399), amarelo (#fbbf24), rosa (#f472b6)
- **Neutras**: Branco (#f8fbff), cinza escuro (#0b1020)

### 📝 Tipografia

- **Geist Sans**: Fonte principal moderna
- **Geist Mono**: Fonte monospace para números

### ✨ Animações

- **Suaves**: Transições de 0.2s
- **Fluidas**: Easing natural
- **Performáticas**: CSS transforms

## 🛠️ Desenvolvimento

### 📦 Instalação

```bash
git clone https://github.com/gabrielroec1/sand-tetris-nextjs.git
cd sand-tetris-nextjs
npm install
```

### 🚀 Desenvolvimento

```bash
npm run dev
```

### 🏗️ Build

```bash
npm run build
```

### 🔍 Lint

```bash
npm run lint
```

## 📊 Performance

### 🎯 Métricas Alvo

- **FPS**: 60 FPS consistentes
- **Tempo de Carregamento**: < 2s
- **Tamanho do Bundle**: < 500KB
- **Lighthouse Score**: > 90

### ✅ Otimizações Implementadas

- ✅ Remoção do Three.js para melhor performance
- ✅ Game loop otimizado
- ✅ Renderização Canvas eficiente
- ✅ CSS otimizado
- ✅ Bundle size reduzido
- ✅ SEO completo implementado
- ✅ PWA capabilities
- ✅ Acessibilidade melhorada

## 🎮 Gameplay

### 🎯 Mecânicas Únicas

1. **Desintegração Imediata**: Peças se quebram instantaneamente
2. **Física de Areia**: Grãos caem naturalmente
3. **Limpeza Automática**: Linhas e pontes são removidas
4. **Pontuação Dinâmica**: Baseada no nível atual
5. **Sistema de Combo**: Multiplicadores de pontuação

### 🧠 Estratégias

- **Agrupe cores**: Para limpar linhas inteiras
- **Construa pontes**: Para remoção em massa
- **Use fast drop**: Para controle preciso
- **Gerencie espaço**: Evite acumular areia
- **Aproveite combos**: Para pontuação máxima

## 🔧 Configuração

### 🌍 Variáveis de Ambiente

```env
NODE_ENV=development
NEXT_PUBLIC_GAME_VERSION=1.0.0
NEXT_PUBLIC_SITE_URL=https://sandtetris.io
```

### ⚙️ Configurações do Next.js

- **Turbopack**: Para desenvolvimento rápido
- **SWC**: Para minificação otimizada
- **App Router**: Para roteamento moderno
- **SEO**: Metadados completos
- **PWA**: Manifest e service worker

## 📱 Responsividade

### 📐 Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### 🎯 Adaptações

- **Controles touch**: Para dispositivos móveis
- **Layout flexível**: Grid responsivo
- **Fontes escaláveis**: Para diferentes telas
- **PWA**: Instalável em qualquer dispositivo

## 🎯 Roadmap

### 🚀 Próximas Features

- [ ] Modo multiplayer
- [ ] Power-ups especiais
- [ ] Modos de jogo alternativos
- [ ] Sistema de achievements
- [ ] Leaderboards online
- [ ] Modo arcade avançado

### 🔧 Melhorias Técnicas

- [ ] WebGL para renderização
- [ ] Web Workers para física
- [ ] Service Worker para cache
- [ ] PWA capabilities completas
- [ ] Analytics integrado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Next.js Team** pelo framework incrível
- **React Team** pela biblioteca de UI
- **Tailwind CSS** pelos estilos utilitários
- **Framer Motion** pelas animações fluidas
- **Vercel** pelo hosting e deploy automático

## 📞 Contato

- **Desenvolvedor**: Gabriel Roec
- **GitHub**: [@gabrielroec1](https://github.com/gabrielroec1)
- **Site**: [sandtetris.io](https://sandtetris.io)
- **Email**: gabrielroec1@gmail.com

---

**🎮 Jogue agora:** [sandtetris.io](https://sandtetris.io)

**Desenvolvido com ❤️ usando Next.js**
