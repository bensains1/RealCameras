
var Application = Application || {};

Application.ShaderConfigurator = (function () {

	var privateMethods = {};
	privateMethods.configuration = function (shaderId) {

		// return privateMethods.bokehShaderConfiguration.call(this);
		return privateMethods.dofShaderConfiguration.call(this);
	};
	privateMethods.dofShaderConfiguration = function () {

		var aspect = 2.35; // 1.85; 
		var canvasWidth = window.innerWidth;
		var canvasHeight = canvasWidth / aspect;

		var near = 0.01;
		var far = 1000;
		
		var settings = {

			size: {
				value: new THREE.Vector2(canvasWidth, canvasHeight) 
				// new THREE.Vector2(this.canvasWidth, this.canvasHeight)
			},
			textel: {
				value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
				// new THREE.Vector2(1.0 / this.canvasWidth, 1.0 / this.canvasHeight)
			},
			znear: {
				value: near 
				// this.camera.near
			},
			zfar: {
				value: far 
				// this.camera.far
			},
			focalDepth: {
				value: 43,
				range: {begin: 0.0, end: 100, step: 0.1} 
			},
			focalLength: {
				value: 45,
				range: {begin: 28, end: 200, step: 1}
			},
			fstop: {
				value: 0.01,
				range: {begin: 0.0, end: 0.1, step: 0.0001}
			},
			showFocus: {
				value: true,
				show: true
			},
			manualdof: {
				value: false
			},
			ndofstart: {
				value: 1.0
			},
			ndofdist: {
				value: 2.0
			},
			fdofstart: {
				value: 2.0
			},
			fdofdist: {
				value: 3.0
			},
			CoC: {
				value: 0.03,
				range: {begin: 0.0, end: 0.1, step: 0.001}
			},
			vignetting: {
				value: true
			},
			vignout: {
				value: 1.3
			},
			vignin: {
				value: 0.1
			},
			vignfade: {
				value: 22.0
			},
			autofocus: {
				value: false,
				show: true
			},
			focus: {
				value: new THREE.Vector2(0.5, 0.5)
			},
			maxblur: {
				value: 2.0,
				range: {begin: 0.0, end: 3.0, step: 0.025}
			},
			threshold: {
				value: 0.5
			},
			gain: {
				value: 2.0
			},
			bias: {
				value: 0.5
			},
			fringe: {
				value: 3.7
			},
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
			depthblur: {
				value: false
			},
			dbsize: {
				value: 1.25
			}				
		};

		var shader = THREE.ShaderLib["depthRGBA"];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		var material = new THREE.ShaderMaterial({ 

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms
		});
		material.blending = THREE.NoBlending;

		return {
			shader: THREE.DoFShader,
			textureId: "tDiffuse",
			settings: settings,
			material: material 
		};	
	};
	privateMethods.bokehShaderConfiguration = function () {

		var aspect = 2.35;

		var settings = {

			focus: {
				value: 1.0,
				range: {begin: 0.0, end: 1.1, step: 0.001} 	
			},
			aperture: {
				value: 0.033,
				range: {begin: 0.001, end: 0.2, step: 0.001} 	
			},
			maxblur: {
				value: 1.0,
				range: {begin: 0.0, end: 3.0, step: 0.025}
			},
			aspect: {
				value: aspect 
				// this.camera.aspect
			},
		};
		var material = new THREE.MeshDepthMaterial();

		return {
			shader: THREE.BokehShader,
			textureId: "tColor",
			settings: settings,
			material: material
		};
	};
		
	return {
		configuration: privateMethods.configuration
	};
})(); 
