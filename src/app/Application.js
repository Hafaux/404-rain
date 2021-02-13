import config from '../config';
import EventEmitter from 'eventemitter3';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import ErrorPageScene from './custom/ErrorPageScene';
// import {
//   Mesh,
//   Color3,
//   FreeCamera,
//   Engine,
//   Scene,
//   SceneLoader,
//   StandardMaterial,
//   UniversalCamera,
//   Vector3,
//   DirectionalLight,
//   HemisphericLight,
//   MeshBuilder,
//   Vector2,
//   ShadowGenerator,
//   SpotLight,
//   PhysicsImpostor,
//   CannonJSPlugin,
//   OimoJSPlugin,
//   DefaultRenderingPipeline,
// } from '@babylonjs/core';
// import gsap from 'gsap/gsap-core';
// import { delay } from './utils';

const EVENTS = {
  APP_READY: 'app_ready',
};

/**
 * App entry point.
 * All configurations are described in src/config.js
 */
export default class Application extends EventEmitter {
  constructor() {
    super();

    this.config = config;
    this.data = { };

    this.container = document.createElement('canvas');

    this.init();
  }

  static get events() {
    return EVENTS;
  }

  /**
   * Initializes the app.
   * Called when the DOM has loaded. You can initiate your custom classes here
   * and manipulate the DOM tree. Task data should be assigned to Application.data.
   * The APP_READY event should be emitted at the end of this method.
   */
  async init() {
    // Initiate classes and wait for async operations here.

    const errorPageScene = new ErrorPageScene(this.container);

    this.data.errorPageScene = errorPageScene;

    this.emit(Application.events.APP_READY);
  }
}

