import * as THREE from "three";
import { GRID_W, GRID_H, BOARD_CELL_PX, CELL_COLORS } from "./constants.js";
import { blocksWorld } from "./tetrominoes.js";
import { idx, inBounds } from "./grid.js";

export class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    this.setupScene();
    this.setupLighting();
    this.setupCamera();

    // Materiais para cada cor
    this.materials = this.createMaterials();

    // Geometria da esfera
    this.sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);

    // Instâncias de esferas para o grid
    this.gridSpheres = [];
    this.currentPieceSpheres = [];
    this.nextPieceSpheres = [];

    this.setupGridSpheres();
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x0b0c10);
  }

  setupLighting() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Luz direcional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Configurar sombras
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setupCamera() {
    // Posicionar câmera para ver o grid de frente com perspectiva 3D
    this.camera.position.set(GRID_W / 2, GRID_H / 2, 15);
    this.camera.lookAt(GRID_W / 2, GRID_H / 2, 0);
  }

  createMaterials() {
    const materials = {};

    // Criar materiais para cada cor com brilho
    Object.keys(CELL_COLORS).forEach((key, index) => {
      const color = new THREE.Color(CELL_COLORS[key]);
      materials[key] = new THREE.MeshLambertMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
      });
    });

    return materials;
  }

  setupGridSpheres() {
    // Criar esferas para cada posição do grid
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const sphere = new THREE.Mesh(this.sphereGeometry, this.materials[1]);
        sphere.position.set(x, GRID_H - y, 0); // Inverter Y para coordenadas 3D
        sphere.visible = false;
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        this.scene.add(sphere);
        this.gridSpheres.push({ mesh: sphere, x, y });
      }
    }
  }

  render(cells, currentPiece, nextPiece, airplaneMode) {
    // Limpar canvas
    this.renderer.clear();

    // Renderizar grid
    this.renderGrid(cells);

    // Renderizar peça atual (se não estiver no modo avião)
    if (!airplaneMode || !airplaneMode.isActive()) {
      this.renderCurrentPiece(currentPiece);
    }

    // Renderizar modo avião
    if (airplaneMode && airplaneMode.isActive()) {
      this.renderAirplaneMode(airplaneMode);
    }

    // Renderizar próxima peça
    this.renderNextPiece(nextPiece);

    // Renderizar cena
    this.renderer.render(this.scene, this.camera);
  }

  renderGrid(cells) {
    // Esconder todas as esferas primeiro
    this.gridSpheres.forEach(({ mesh }) => {
      mesh.visible = false;
    });

    // Mostrar esferas onde há partículas
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const cellIndex = idx(x, y);
        const cellValue = cells[cellIndex];

        if (cellValue !== 0) {
          const sphereData = this.gridSpheres.find((s) => s.x === x && s.y === y);
          if (sphereData) {
            sphereData.mesh.material = this.materials[cellValue];
            sphereData.mesh.visible = true;

            // Adicionar animação sutil de rotação
            sphereData.mesh.rotation.y += 0.01;
          }
        }
      }
    }
  }

  renderCurrentPiece(piece) {
    // Remover esferas da peça anterior
    this.currentPieceSpheres.forEach((sphere) => {
      this.scene.remove(sphere);
    });
    this.currentPieceSpheres = [];

    if (!piece) return;

    const blocks = blocksWorld(piece);
    const material = this.materials[piece.color];

    for (const [bx, by] of blocks) {
      if (inBounds(bx, by)) {
        const sphere = new THREE.Mesh(this.sphereGeometry, material);
        sphere.position.set(bx, GRID_H - by, 0.1); // Ligeiramente na frente
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        // Adicionar brilho à peça atual
        sphere.material.emissive = new THREE.Color(0x222222);

        this.scene.add(sphere);
        this.currentPieceSpheres.push(sphere);
      }
    }
  }

  renderNextPiece(piece) {
    // Remover esferas da próxima peça anterior
    this.nextPieceSpheres.forEach((sphere) => {
      this.scene.remove(sphere);
    });
    this.nextPieceSpheres = [];

    if (!piece) return;

    const material = this.materials[piece.color];
    const blocks = piece.rotations[0];
    const offsetX = GRID_W + 2; // Posição à direita do grid
    const offsetY = GRID_H - 5; // Posição no topo

    for (const [x, y] of blocks) {
      const sphere = new THREE.Mesh(this.sphereGeometry, material);
      sphere.position.set(offsetX + x, offsetY - y, 0.1);
      sphere.scale.setScalar(0.6); // Menor que as esferas do grid
      sphere.castShadow = true;
      sphere.receiveShadow = true;

      this.scene.add(sphere);
      this.nextPieceSpheres.push(sphere);
    }
  }

  renderAirplaneMode(airplaneMode) {
    // Renderizar avião e balas em 3D
    airplaneMode.render3D(this.scene, this.materials);
  }

  resizeCanvas() {
    const INTERNAL_W = GRID_W * BOARD_CELL_PX;
    const INTERNAL_H = GRID_H * BOARD_CELL_PX;

    this.canvas.width = INTERNAL_W;
    this.canvas.height = INTERNAL_H;

    this.renderer.setSize(INTERNAL_W, INTERNAL_H);
    this.camera.aspect = INTERNAL_W / INTERNAL_H;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    // Limpar recursos Three.js
    this.scene.clear();
    this.renderer.dispose();
  }
}
