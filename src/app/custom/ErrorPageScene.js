import gsap from 'gsap';
import {
  Mesh,
  Color3,
  Engine,
  Scene,
  SceneLoader,
  StandardMaterial,
  UniversalCamera,
  Vector3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  Vector2,
  ShadowGenerator,
  SpotLight,
  PhysicsImpostor,
  DefaultRenderingPipeline,
} from '@babylonjs/core';
import { delay } from '../utils';

/**
 * Class representing the 404 error page babylon.js scene
 */
export default class ErrorPageScene {
  constructor(canvas) {
    this.container = canvas;

    this.engine = new Engine(this.container, true);
    this.scene = new Scene(this.engine);
    this.camera = new UniversalCamera('cam', new Vector3(0, 0.6, -2), this.scene);

    this.lights = [];
    this.shadowGenerator = null;
    this.pipeline = null;

    this.materials = {
      yellow: new StandardMaterial('yellowMat', this.scene),
      white: new StandardMaterial('whiteMat', this.scene),
    };
    this.materials.yellow.diffuseColor = new Color3(0.97, 0.79, 0.03);
    this.materials.white.diffuseColor = new Color3(1, 1, 1);

    this._init();
  }

  /**
   * Initializes the scene.
   * @private
   */
  _init() {
    this._appendCanvas();

    const gravityVector = new Vector3(0, -9.81, 0);

    this.scene.enablePhysics(gravityVector);
    this.scene.clearColor = new Color3.Black();

    this.camera.minZ = 0.1;
    this.camera.cameraRotation = new Vector2(0.01, 0);

    this._addPipeline();
    this._addLights();
    this._addGround();
    this._add404Text();
    this._addListeners();

    this._glitchEffect();
    setInterval(this._glitchEffect.bind(this), 7000);

    this.engine.resize();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  /**
   * Appends the canvas element to the dom.
   * @private
   */
  _appendCanvas() {
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.id = 'gameCanvas';

    document.body.appendChild(this.container);
  }

  /**
   * Adds the click and resize event listeners.
   * @private
   */
  _addListeners() {
    this.container.addEventListener('click', this._handleClick.bind(this));

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Drop Os when the user clicks
   * @private
   */
  async _handleClick() {
    for (let i = 0, x = -0.4; i < 3; i++, x += 0.4) {
      this._addO(x);
      await delay(200);
    }
  }

  /**
   * Adds an o-model to the scene
   * @private
   */
  async _addO(x) {
    const { meshes: [, mesh] } = await SceneLoader.ImportMeshAsync(null, '../assets/', 'o.glb', this.scene);
    const oMesh = Mesh.MergeMeshes([mesh], true);
    const scaleFactor = (Math.random() * 0.5) + 0.5;

    oMesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
    oMesh.physicsImpostor = new PhysicsImpostor(oMesh, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6 });

    oMesh.material = this.materials.yellow;
    oMesh.rotation.x = Math.PI / 2;
    oMesh.position.x = x;
    oMesh.position.y = 1.4;
    oMesh.position.z = (Math.random() * 0.5) + 0.1;

    setTimeout(() => {
      oMesh.dispose();
    }, 20000);
  }

  /**
   * @private
   */
  async _glitchEffect() {
    gsap.to(this.pipeline.grain, { intensity: 100, animated: 100, duration: 0.1, ease: 'power2.in' });
    await gsap.to(this.pipeline.chromaticAberration, { aberrationAmount: 50, duration: 0.1, ease: 'power2.in' });

    gsap.to(this.pipeline.grain, { intensity: 0, animated: 0, duration: 0.5 });
    gsap.to(this.pipeline.chromaticAberration, { aberrationAmount: 2, duration: 0.5 });
  }

  /**
   * Adds lights and shadows to the scene.
   * @private
   */
  _addLights() {
    this.lights = [
      new DirectionalLight('dir01', new Vector3(0.5, -1, 2), this.scene),
      new SpotLight('spot01', new Vector3(30, 40, 20), new Vector3(-1, -2, -1), 1.1, 16, this.scene),
      new HemisphericLight('hem01', new Vector3(0, 10, 0), this.scene),
    ];

    this.lights[1].intensity = 0.5;
    this.lights[2].intensity = 0.3;

    this.shadowGenerator = new ShadowGenerator(1024, this.lights[0]);

    this.shadowGenerator.useExponentialShadowMap = true;
  }

  /**
   * Adds the yellow ground plane.
   * @private
   */
  _addGround() {
    const ground = MeshBuilder.CreateBox('plane', { width: 20, height: 4 }, this.scene);

    ground.position.y = -0.5;
    ground.material = this.materials.yellow;
    ground.rotation.x = Math.PI / 2;
    ground.receiveShadows = true;
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 });
  }

  /**
   * Adds a default rendering pipeline and enables grain and chromatic aberration.
   * @private
   */
  _addPipeline() {
    this.pipeline = new DefaultRenderingPipeline('defaultPipeline', true, this.scene, [this.camera]);
    this.pipeline.samples = 4;
    this.pipeline.grainEnabled = true;
    this.pipeline.chromaticAberrationEnabled = true;
  }

  /**
   * Loads the 404 text model and adds a collision box around it.
   * @private
   */
  async _add404Text() {
    const boundingBox = MeshBuilder.CreateBox('sphere', { width: 1.1, height: 1.05, depth: 0.2 }, this.scene);

    boundingBox.position.z = 0.1;
    boundingBox.position.x = 0.1;
    boundingBox.visibility = 0;
    boundingBox.physicsImpostor = new PhysicsImpostor(boundingBox, PhysicsImpostor.BoxImpostor, { mass: 0 });

    const { meshes: [, errorTextMesh] } = await SceneLoader.ImportMeshAsync(null, '../assets/', '404.gltf', this.scene);

    this.lights[2].excludedMeshes = [errorTextMesh];
    this.shadowGenerator.addShadowCaster(errorTextMesh);
    errorTextMesh.material = this.materials.white;
    errorTextMesh.rotate(new Vector3(0, 0, 1), Math.PI);
  }
}
