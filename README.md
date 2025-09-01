# 🎮 Sand Tetris - Next.js

Um jogo de Tetris com física de areia, construído com Next.js 15, React 19 e TypeScript.

## ✨ Características

- **Física de Areia Realista**: As peças se desintegram em grãos de areia que caem naturalmente
- **Limpeza Inteligente**: Linhas monocromáticas e pontes são limpas automaticamente
- **Performance Otimizada**: Game loop ultra otimizado para 60 FPS suaves
- **Design Moderno**: Interface elegante com animações CSS
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Controles Intuitivos**: Teclado e mouse suportados

## 🎯 Como Jogar

### Controles

- **A/D**: Mover peça para esquerda/direita
- **Espaço**: Queda rápida (fast drop)
- **P**: Pausar/despausar
- **R**: Reiniciar jogo

### Mecânicas

- **Desintegração**: Peças se quebram em areia ao tocar a superfície
- **Limpeza de Linhas**: Linhas da mesma cor são limpas automaticamente
- **Pontes**: Areia conectada de uma borda à outra é removida
- **Pontuação**: Pontos por linhas e pontes limpas
- **Níveis**: Velocidade aumenta conforme o score

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações fluidas
- **Canvas API** - Renderização 2D otimizada

## 🏗️ Arquitetura

```
src/
├── app/                 # App Router do Next.js
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página do jogo
│   └── globals.css     # Estilos globais
├── components/         # Componentes React
│   └── GameCanvas.tsx  # Canvas do jogo
└── hooks/             # Hooks customizados
    └── useGameLogic.ts # Lógica do jogo
```

## ⚡ Otimizações de Performance

### Game Loop

- **60 FPS** garantidos com `requestAnimationFrame`
- **Throttling inteligente** para evitar sobrecarga
- **Cálculos otimizados** para física de areia
- **Renderização eficiente** com Canvas 2D

### Memória

- **Garbage collection** otimizado
- **Referências estáveis** para evitar re-renders
- **Buffers de animação** para reduzir operações

### CSS

- **Animações CSS** ao invés de JavaScript
- **Will-change** para otimização de GPU
- **Gradientes otimizados** para background

## 🎨 Design System

### Cores

- **Primárias**: Tons de roxo e azul
- **Secundárias**: Verde, amarelo, rosa
- **Neutras**: Branco, cinza escuro

### Tipografia

- **Geist Sans**: Fonte principal
- **Geist Mono**: Fonte monospace para números

### Animações

- **Suaves**: Transições de 0.2s
- **Fluidas**: Easing natural
- **Performáticas**: CSS transforms

## 🛠️ Desenvolvimento

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## 📊 Performance

### Métricas Alvo

- **FPS**: 60 FPS consistentes
- **Tempo de Carregamento**: < 2s
- **Tamanho do Bundle**: < 500KB
- **Lighthouse Score**: > 90

### Otimizações Implementadas

- ✅ Remoção do Three.js para melhor performance
- ✅ Game loop otimizado
- ✅ Renderização Canvas eficiente
- ✅ CSS otimizado
- ✅ Bundle size reduzido

## 🎮 Gameplay

### Mecânicas Únicas

1. **Desintegração Imediata**: Peças se quebram instantaneamente
2. **Física de Areia**: Grãos caem naturalmente
3. **Limpeza Automática**: Linhas e pontes são removidas
4. **Pontuação Dinâmica**: Baseada no nível atual

### Estratégias

- **Agrupe cores**: Para limpar linhas inteiras
- **Construa pontes**: Para remoção em massa
- **Use fast drop**: Para controle preciso
- **Gerencie espaço**: Evite acumular areia

## 🔧 Configuração

### Variáveis de Ambiente

```env
NODE_ENV=development
NEXT_PUBLIC_GAME_VERSION=1.0.0
```

### Configurações do Next.js

- **Turbopack**: Para desenvolvimento rápido
- **SWC**: Para minificação otimizada
- **App Router**: Para roteamento moderno

## 📱 Responsividade

### Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### Adaptações

- **Controles touch**: Para dispositivos móveis
- **Layout flexível**: Grid responsivo
- **Fontes escaláveis**: Para diferentes telas

## 🎯 Roadmap

### Próximas Features

- [ ] Modo multiplayer
- [ ] Power-ups especiais
- [ ] Modos de jogo alternativos
- [ ] Sistema de achievements
- [ ] Leaderboards online

### Melhorias Técnicas

- [ ] WebGL para renderização
- [ ] Web Workers para física
- [ ] Service Worker para cache
- [ ] PWA capabilities

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Next.js Team** pelo framework incrível
- **React Team** pela biblioteca de UI
- **Tailwind CSS** pelos estilos utilitários
- **Framer Motion** pelas animações fluidas

---

**Desenvolvido com ❤️ usando Next.js**
