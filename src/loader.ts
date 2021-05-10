// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import CameraControls from "camera-controls";
import { LoadingManager, Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, Object3D, DirectionalLight, HemisphereLight, Vector3, Color, Camera, Vector4, Box3, MeshPhysicalMaterial } from "three";
import { TiltLoader } from "three/examples/jsm/loaders/TiltLoader";
import { LegacyGLTFLoader } from "./legacy/LegacyGLTFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Convert, JSONIcosaFormat, JSONPolyFormat } from "./JSONSchema";
import { TiltBrushShaders } from "./tiltbrush/Tiltbrushshaders"; 
import { TiltShaderLoader } from "./tiltbrush/TiltShaderLoader.js";

export class Loader {
    private scene : Scene;

    private tiltLoader : TiltLoader;
    private gltfLoader : GLTFLoader;
    private legacygltf : LegacyGLTFLoader;

    private sceneCamera : Camera;
    private sceneColor : Color = new Color("#000000");

    private cameraControls : CameraControls;

    private loadedModel? : Object3D;

    private loaded : boolean = false;

    private updateableMeshes : Mesh[] = [];

    constructor (scene : Scene, sceneCamera : Camera, cameraControls : CameraControls) {        
        const manager = new LoadingManager();
        manager.onStart = function( ) {
            document.getElementById('loadscreen')?.classList.remove('fade-out');
            document.getElementById('loadscreen')?.classList.remove('loaded');
        };
        manager.onLoad = function ( ) {        
            document.getElementById('loadscreen')?.classList.add('fade-out');
        };

        this.tiltLoader = new TiltLoader(manager);
        this.gltfLoader = new GLTFLoader(manager);

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        this.legacygltf = new LegacyGLTFLoader(manager);
        this.scene = scene;
        this.sceneCamera = sceneCamera;
        this.cameraControls = cameraControls;
    }

    public update(deltaTime : number) {
        if(!this.loaded)
            return;

        // _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
        var time = new Vector4(deltaTime/20, deltaTime, deltaTime*2, deltaTime*3);

        // Update uniforms of meshes that need it.
        this.updateableMeshes.forEach((mesh) => {
            var material = mesh.material as Material;
            switch (material.name) {
                case "material_DiamondHull":
                    (material as RawShaderMaterial).uniforms!["cameraPosition"].value = this.sceneCamera.position;
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
                case "material_ChromaticWave":
                case "material_Comet":
                case "material_Disco":
                case "material_Electricity":
                case "material_Embers":
                case "material_Fire":
                case "material_Hypercolor":
                case "material_LightWire":
                case "material_NeonPulse":
                case "material_Plasma":
                case "material_Rainbow":
                case "material_Snow":
                case "material_Stars":
                case "material_Streamers":
                case "material_Waveform":
                case "material_WigglyGraphite":
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
            }
        });
    }

    private initGltf2(url : string) {
        this.gltfLoader.load(url, (gltf) => {
            this.loadedModel = gltf.scene;
            var light0transform = this.loadedModel.getObjectByName("node_SceneLight_0_i1")?.modelViewMatrix;
            var light1transform = this.loadedModel.getObjectByName("node_SceneLight_1_i2")?.modelViewMatrix;
            this.loadedModel.traverse((object : Object3D) => {
                if(object.type === "Mesh") {
                    var mesh = object as Mesh;
                    var material = mesh.material as Material;
                    switch(material.name) {
                        case "brush_BlocksBasic":
                            mesh.geometry.name = "geometry_BlocksBasic";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["BlocksBasic"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_BlocksBasic";
                            });
                            break;
                        case "brush_BlocksGem":
                            mesh.geometry.name = "geometry_BlocksGem";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["BlocksGem"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_BlocksGem";
                            });
                            break;
                        case "brush_BlocksGlass":
                            mesh.geometry.name = "geometry_BlocksGlass";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["BlocksGlass"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_BlocksGlass";
                            });
                            break;

                        case "brush_Bubbles":
                            mesh.geometry.name = "geometry_Bubbles";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Bubbles"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Bubbles";
                            });
                            break;

                        case "brush_CelVinyl":
                            mesh.geometry.name = "geometry_CelVinyl";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["CelVinyl"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_CelVinyl";
                            });
                            break;

                        case "brush_ChromaticWave":
                            mesh.geometry.name = "geometry_ChromaticWave";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["ChromaticWave"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_ChromaticWave";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_CoarseBristles":
                            mesh.geometry.name = "geometry_CoarseBristles";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["CoarseBristles"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_CoarseBristles";
                            });
                            break;

                        case "brush_Comet":
                            mesh.geometry.name = "geometry_Comet";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Comet"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Comet";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_DiamondHull":
                            mesh.geometry.name = "geometry_DiamondHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["DiamondHull"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_DiamondHull";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Disco":
                            mesh.geometry.name = "geometry_Disco";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Disco"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Disco";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_DotMarker":
                            mesh.geometry.name = "geometry_DotMarker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["DotMarker"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_DotMarker";
                            });
                            break;

                        case "brush_Dots":
                            mesh.geometry.name = "geometry_Dots";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Dots"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Dots";
                            });
                            break;

                        case "brush_DoubleTaperedFlat":
                            mesh.geometry.name = "geometry_DoubleTaperedFlat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["DoubleTaperedFlat"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_DoubleTaperedFlat";
                            });
                            break;

                        case "brush_DoubleTaperedMarker":
                            mesh.geometry.name = "geometry_DoubleTaperedMarker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["DoubleTaperedMarker"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_DoubleTaperedMarker";
                            });
                            break;

                        case "brush_DuctTape":
                            mesh.geometry.name = "geometry_DuctTape";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["DuctTape"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_DuctTape";
                            });
                            break;

                        case "brush_Electricity":
                            mesh.geometry.name = "geometry_Electricity";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Electricity"], function( shader ) {
                                mesh.material = shader;
                                mesh.material.name = "material_Electricity";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Embers":
                            mesh.geometry.name = "geometry_Embers";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Embers"], function( shader ) {
                                mesh.material = shader;
                                mesh.material.name = "material_Embers";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_EnvironmentDiffuse":
                            mesh.geometry.name = "geometry_EnvironmentDiffuse";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["EnvironmentDiffuse"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_EnvironmentDiffuse";
                            });
                            break;

                        case "brush_EnvironmentDiffuseLightMap":
                            mesh.geometry.name = "geometry_EnvironmentDiffuseLightMap";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["EnvironmentDiffuseLightMap"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_EnvironmentDiffuseLightMap";
                            });
                            break;

                        case "brush_Fire":
                            mesh.geometry.name = "geometry_Fire";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Fire"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Fire";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Flat":
                            mesh.geometry.name = "geometry_Flat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Flat"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Flat";
                            });
                            break;

                        case "brush_FlatDeprecated":
                            mesh.geometry.name = "geometry_FlatDeprecated";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["FlatDeprecated"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_FlatDeprecated";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Highlighter":
                            mesh.geometry.name = "geometry_Highlighter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Highlighter"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Highlighter";
                            });
                            break;

                        case "brush_Hypercolor":
                            mesh.geometry.name = "geometry_Hypercolor";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Hypercolor"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Hypercolor";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_HyperGrid":
                            mesh.geometry.name = "geometry_HyperGrid";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["HyperGrid"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_HyperGrid";
                            });
                            break;

                        case "brush_Icing":
                            mesh.geometry.name = "geometry_Icing";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            new TiltShaderLoader().load(TiltBrushShaders["Icing"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Icing";
                            });
                            break;

                        case "brush_Ink":
                            mesh.geometry.name = "geometry_Ink";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Ink"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Ink";
                            });
                            break;

                        case "brush_Leaves":
                            mesh.geometry.name = "geometry_Leaves";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Leaves"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Leaves";
                            });
                            break;

                        case "brush_Light":
                            mesh.geometry.name = "geometry_Light";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            new TiltShaderLoader().load(TiltBrushShaders["Light"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                    mesh.material.name = "material_Light";
                            });
                            break;

                        case "brush_LightWire":
                            mesh.geometry.name = "geometry_LightWire";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["LightWire"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_LightWire";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Lofted":
                            mesh.geometry.name = "geometry_Lofted";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Lofted"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Lofted";
                            });
                            break;

                        case "brush_Marker":
                            mesh.geometry.name = "geometry_Marker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Marker"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Marker";
                            });
                            break;

                        case "brush_MatteHull":
                            mesh.geometry.name = "geometry_MatteHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            new TiltShaderLoader().load(TiltBrushShaders["MatteHull"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_MatteHull";
                            });
                            break;

                        case "brush_NeonPulse":
                            mesh.geometry.name = "geometry_NeonPulse";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["NeonPulse"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_NeonPulse";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_OilPaint":
                            mesh.geometry.name = "geometry_OilPaint";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            new TiltShaderLoader().load(TiltBrushShaders["OilPaint"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_OilPaint";
                            });
                            break;

                        case "brush_Paper":
                            mesh.geometry.name = "geometry_Paper";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Paper"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Paper";
                            });
                            break;

                        case "brush_PbrTemplate":
                            mesh.geometry.name = "geometry_PbrTemplate";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["PbrTemplate"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_PbrTemplate";
                            });
                            break;

                        case "brush_PbrTransparentTemplate":
                            mesh.geometry.name = "geometry_PbrTransparentTemplate";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["PbrTransparentTemplate"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_PbrTransparentTemplate";
                            });
                            break;

                        case "brush_Petal":
                            mesh.geometry.name = "geometry_Petal";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Petal"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Petal";
                            });
                            break;

                        case "brush_Plasma":
                            mesh.geometry.name = "geometry_Plasma";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Plasma"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Plasma";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Rainbow":
                            mesh.geometry.name = "geometry_Rainbow";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            new TiltShaderLoader().load(TiltBrushShaders["Rainbow"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Rainbow";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_ShinyHull":
                            mesh.geometry.name = "geometry_ShinyHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["ShinyHull"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_ShinyHull";
                            });
                            break;

                        case "brush_Smoke":
                            mesh.geometry.name = "geometry_Smoke";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Smoke"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Smoke";
                            });
                            break;

                        case "brush_Snow":
                            mesh.geometry.name = "geometry_Snow";
                            
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Snow"], function( shader ) {
                                mesh.material = shader;
                                mesh.material.name = "material_Snow";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_SoftHighlighter":
                            mesh.geometry.name = "geometry_SoftHighlighter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["SoftHighlighter"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_SoftHighlighter";
                            });
                            break;

                        case "brush_Spikes":
                            mesh.geometry.name = "geometry_Spikes";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Spikes"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Spikes";
                            });
                            break;

                        case "brush_Splatter":
                            mesh.geometry.name = "geometry_Splatter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Splatter"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Splatter";
                            });
                            break;

                        case "brush_Stars":
                            mesh.geometry.name = "geometry_Stars";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            new TiltShaderLoader().load(TiltBrushShaders["Stars"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Stars";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Streamers":
                            mesh.geometry.name = "geometry_Streamers";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Streamers"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Streamers";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Taffy":
                            mesh.geometry.name = "geometry_Taffy";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["DiamondHull"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_DiamondHull";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_TaperedFlat":
                            mesh.geometry.name = "geometry_TaperedFlat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["TaperedFlat"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_TaperedFlat";
                            });
                            break;

                        case "brush_TaperedMarker":
                            mesh.geometry.name = "geometry_TaperedMarker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["TaperedMarker"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_TaperedMarker";
                            });
                            break;

                        case "brush_TaperedMarker_Flat":
                            mesh.geometry.name = "geometry_Flat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Flat"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Flat";
                            });
                            break;

                        case "brush_ThickPaint":
                            mesh.geometry.name = "geometry_ThickPaint";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["ThickPaint"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_ThickPaint";
                            });
                            break;

                        case "brush_Toon":
                            mesh.geometry.name = "geometry_Toon";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            new TiltShaderLoader().load(TiltBrushShaders["Toon"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Toon";
                            });
                            break;

                        case "brush_UnlitHull":
                            mesh.geometry.name = "geometry_UnlitHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            new TiltShaderLoader().load(TiltBrushShaders["UnlitHull"], function(shader) {
                                mesh.material = shader;
                                mesh.material.name = "material_UnlitHull";
                            });
                            break;

                        case "brush_VelvetInk":
                            mesh.geometry.name = "geometry_VelvetInk";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["VelvetInk"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_VelvetInk";
                            });
                            break;

                        case "brush_Waveform":
                            mesh.geometry.name = "geometry_Waveform";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["Waveform"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_Waveform";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_WetPaint":
                            mesh.geometry.name = "geometry_WetPaint";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["WetPaint"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_WetPaint";
                            });
                            break;

                        case "brush_WigglyGraphite":
                            mesh.geometry.name = "geometry_WigglyGraphite";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            new TiltShaderLoader().load(TiltBrushShaders["WigglyGraphite"], function( shader ) {
                                shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                                shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                                shader.uniformsNeedUpdate = true;
                                mesh.material = shader;
                                mesh.material.name = "material_WigglyGraphite";
                            });
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Wire":
                            mesh.geometry.name = "geometry_Wire";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            new TiltShaderLoader().load(TiltBrushShaders["Wire"], function( shader ) {
                                mesh.material = shader;
                                mesh.material.name = "material_Wire";
                            });
                            break;

                        default:
                            mesh.material = new MeshStandardMaterial( { visible: false } );
                    }
                    // if (material.name!=="brush_TaperedMarker")
                    // {
                    //     mesh.material = new MeshStandardMaterial( { visible: false } );
                    // }
                    // else
                    // {
                    //     console.log(Object.keys(mesh.geometry.attributes));
                    // }
                }
            });

            this.finishSetup(this.loadedModel);
        });
    }

    private finishSetup(model: Object3D) {
        this.scene.clear();
        this.scene.background = this.sceneColor;
        this.scene.add(model);

        // Setup camera to center model
        const box = new Box3().setFromObject(model);
        const boxSize = box.getSize(new Vector3()).length();
        const boxCenter = box.getCenter(new Vector3());

        this.cameraControls.minDistance = boxSize * 0.01;
        this.cameraControls.maxDistance = boxSize;

        const midDistance = this.cameraControls.minDistance + (this.cameraControls.maxDistance - this.cameraControls.minDistance) / 2;
        this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
        this.cameraControls.dollyTo(midDistance, true);
        this.cameraControls.saveState();

        // DEBUG LIGHTING
        var keyLightNode = new DirectionalLight(0xFFEEDD, 0.325);
        keyLightNode.position.set(-19.021, 34.882, -19.134);
        keyLightNode.scale.set(0, 0, 16.828);
        this.scene.add(keyLightNode);

        var headLightNode = new DirectionalLight(0xFFEEDD, 0.250);
        headLightNode.position.set(-16.661, 8.330, 8.330);
        headLightNode.scale.set(1, 1, 1);
        this.scene.add(headLightNode);

        var __hemi__ = new HemisphereLight(0xEFEFFF, 0xB2B2B2, 0.6);
        __hemi__.position.set(0, 1, 0);
        this.scene.add(__hemi__);

        this.loaded = true;
    }

    private initTilt(url : string) {
        this.tiltLoader.load(url, (tilt) => {
            this.loadedModel = tilt;
            this.finishSetup(this.loadedModel);
        });
    }

    private initPolyGltf(url : string) {
        this.legacygltf.load(url, (gltf) => {
            this.loadedModel = gltf.scene;
            this.finishSetup(this.loadedModel);
        });
    }

    private initPolyGltf2(url : string) {
        this.gltfLoader.load(url, (gltf) => {
            this.loadedModel = gltf.scene;
            this.finishSetup(this.loadedModel);
        });
    }

    public loadGLTF(url : string) {
        this.initGltf2(url);
    }

    public loadIcosaAsset(userID : string, assetID : string, format? : string) {
        const http = new XMLHttpRequest();
        const url = `https://api.icosa.gallery/assets/${userID}/${assetID}`;
        const that = this;
        
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const icosaAsset = Convert.toIcosa(this.response);
                
                let types: { [name: string]: JSONIcosaFormat } = {};

                icosaAsset.formats.forEach(newformat => {
                    types[newformat.format] = newformat;
                });

                if(format) {
                    switch(format) {
                        case "GLTF2":
                            if(types.hasOwnProperty("GLTF2")) {
                                that.initPolyGltf2(types.GLTF2.url);
                                return;
                            }
                            break;
                        case "GLTF":
                            if(types.hasOwnProperty("GLTF")) {
                                that.initPolyGltf(types.GLTF.url);
                                return;
                            }
                            break;
                        case "TILT":
                            if(types.hasOwnProperty("TILT")) {
                                that.initTilt(types.TILT.url);
                                return;
                            }
                            break;
                        default:
                            break;
                    }
                }

                // If no format specified, return in preferred order
                if(types.hasOwnProperty("GLTF2")) {
                    that.initGltf2(types.GLTF2.url);
                    return;
                }

                if(types.hasOwnProperty("GLTF")) {
                    that.initPolyGltf(types.GLTF.url);
                    return;
                }
                
                // At the moment tilt files should always be least priority as the renderer
                // still just uses control points.
                if(types.hasOwnProperty("TILT")) {
                    that.initTilt(types.TILT.url);
                    return;
                }
            }
        }

        http.open("GET", url, true);
        http.send();
    }

    public loadIcosaUrl(url : string, format?: string) {
        var splitURL = url.split('/');
        if(splitURL[2] === "icosa.gallery")
            this.loadIcosaAsset(splitURL[4], splitURL[5], format);
    }

    public loadPolyAsset(assetID : string, format? : string) {
        const http = new XMLHttpRequest();
        const url = `https://api.icosa.gallery/poly/assets/${assetID}`;

        const that = this;
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const polyAsset = Convert.toPoly(this.response);

                // To dict, for format preference sorting
                let types: { [name: string]: JSONPolyFormat } = {}; 

                if(polyAsset.presentationParams.backgroundColor) {
                    that.sceneColor = new Color(polyAsset.presentationParams.backgroundColor);
                }

                polyAsset.formats.forEach(format => {
                    types[format.formatType] = format;
                });

                // Check if specific format requested, otherwise loop through order of preference
                if(format) {
                    switch (format) {
                        case "GLTF2":
                            if(types.hasOwnProperty("GLTF2")) {
                                that.initPolyGltf2(types.GLTF2.root.url);
                                return;
                            }
                            break;
                        case "GLTF":
                            if(types.hasOwnProperty("GLTF")) {
                                that.initPolyGltf(types.GLTF.root.url);
                                return;
                            }
                            break;
                        case "TILT":
                            if(types.hasOwnProperty("TILT")) {
                                that.initTilt(types.TILT.root.url);
                                return;
                            }
                            break;
                        default:
                            break;
                    }
                }

                // If no format specified, return in preferred order
                if(types.hasOwnProperty("GLTF2")) {
                    that.initPolyGltf2(types.GLTF2.root.url);
                    return;
                }

                if(types.hasOwnProperty("GLTF")) {
                    that.initPolyGltf(types.GLTF.root.url);
                    return;
                }
                
                // At the moment tilt files should always be least priority as the renderer
                // still just uses control points.
                if(types.hasOwnProperty("TILT")) {
                    that.initTilt(types.TILT.root.url);
                    return;
                }
            }
        }

        http.open("GET", url, true);
        http.send();
    }

    public loadPolyUrl(url : string, format? : string) {
        var splitURL = url.split('/');
        if(splitURL[2] === "poly.google.com")
            this.loadPolyAsset(splitURL[4], format);
    }

    public loadPolyTilt(url : string) {
        this.loadPolyUrl(url, "TILT");
    }

    public loadPolyGltf(url : string) {
        this.loadPolyUrl(url, "GLTF");
    }
}