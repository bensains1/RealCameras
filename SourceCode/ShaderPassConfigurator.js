
var Application = Application || {};

Application.ShaderPassConfigurator = (function () {

	var privateStore = {};
	function ShaderPassConfigurator () {

		var dvc = Application.DistanceValuesConvertor.getInstance();
		// TODO:
		// ACM p.13
		privateStore.aspect = 2.35; // 1.85;
		privateStore.near = 0.01;
		privateStore.far = 1000.0;
	};
	
	ShaderPassConfigurator.prototype.configuration = function (passId) {

		var configuration = null;
		switch (passId) {
			case "bokeh_0": {
				configuration = privateMethods.bokehPassConfiguration_0.call(this);
				break;
			} 
			case "bokeh_1": {
				configuration = privateMethods.bokehPassConfiguration_1.call(this);
				break;
			} 
			case "depth_1": {
				configuration = privateMethods.bokehPassConfiguration_2.call(this);
				break;
			}	
		}
		return configuration
	};

	var privateMethods = Object.create(ShaderPassConfigurator.prototype);
	privateMethods.bokehPassConfiguration_0 = function () {
 		
		var dvc = Application.DistanceValuesConvertor.getInstance();

// TODO:
		var canvasWidth = window.innerWidth;
		var canvasHeight = canvasWidth / privateStore.aspect;

		var beforeNear = privateStore.near + dvc(1.0, "m");
		var settings = {

			size: {
				value: new THREE.Vector2(canvasWidth, canvasHeight) 
			},
			textel: {
				value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
			},

// mark - 

			znear: {
				value: privateStore.near
			},
			zfar: {
				value: privateStore.far
			},

// mark -
			aspect: {
				value: 1.33
			},
			framesize:{
				value: 35.00
			},
			showFocus: {
				value: true,
				show: true
			},
			focalDepth: {
				value: dvc(5.0, "m") 
			},
			focalLength: {
				value: dvc(35.0, "mm")
			//	range: {begin: 35, end: 200, step: 10}
			},
			// Non-dimensional value (f-stop = focal-length/aperture)
			aperture: {
				value: 1,
			//	range: {begin: 1, end: 10, step: 2}
			},
			coc: {
				value: dvc(0.03, "mm")
				// range: {begin: dvc(0.0, "mm"), end: dvc(1.0, "mm"), step: dvc(0.001, "mm")}
			},
			autofocus: {
				value: false
				// show: true
			},
			// Non-dimensional 2D-vector.
			focus: {
				value: new THREE.Vector2(0.5, 0.5)
			},

			maxblur: {
				value: 2.0,
				range: {begin: 0.0, end: 3.0, step: 0.025}
			},

// mark -

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

// mark -

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
// mark - 
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
// mark -
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
// mark -
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
			material: material,
			updateCamera: function (camera) {

// TODO:
				// size: {
				// 	value: new THREE.Vector2(canvasWidth, canvasHeight) 
				// 	// new THREE.Vector2(this.canvasWidth, this.canvasHeight)
				// },
				// textel: {
				// 	value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
				// 	// new THREE.Vector2(1.0 / this.canvasWidth, 1.0 / this.canvasHeight)
				// },

				camera.near = this.settings.znear.value;
				camera.far = this.settings.zfar.value;
				//var frameSize = 88.00;

				camera.focalLength = this.settings.focalLength.value;
				camera.setLens(camera.focalLength, camera.frameSize);
				camera.updateProjectionMatrix();
			},
			updateRender: function (render) {
				//change size of render, 
				//find aspect 
				//find offset				

			}
		};	
	};
	privateMethods.bokehPassConfiguration_1 = function () {

		var dvc = Application.DistanceValuesConvertor.getInstance();

		var beforeNear = privateStore.near + dvc(1.0, "m");
		var settings = {

			znear: {
				value: privateStore.near 
			},
			zfar: {
				value: privateStore.far
			},
			aspect: {
				value: 1.33
			},
			framesize:{
				value: 35.00
			},
			focalDepth: {
				value: dvc(5.0, "feet")
			//	range: {begin: beforeNear, end: privateStore.far, step: dvc(0.001, "m")}
			},
			focalLength: {
				value: dvc(100.0, "mm")
			},
			aperture: {
				value: 12
			//	range: {begin: 5, end: 22, step: 1} 	
			},
			maxblur: {
				value: 0.01,
				range: {begin: 0.0, end: 0.5, step: 0.001}
			}
		};
		var material = new THREE.MeshDepthMaterial();

		return {
			shader: THREE.BokehShader,
			textureId: "tColor",
			settings: settings,
			material: material,
			updateCamera: function (camera) {

				camera.aspect = this.settings.aspect.value;
				camera.updateProjectionMatrix();
			},
			updateRender: function (render) {
				//change size of render, 
				//find aspect 
				//find offset				

			}
		};
	};
	privateMethods.bokehPassConfiguration_2 = function () {

		var canvasWidth = window.innerWidth;
		var aspect = 1.33;
		var canvasHeight = canvasWidth / aspect;
		var near = 0.01;
		var far = 1000;
		var dvc = Application.DistanceValuesConvertor.getInstance();
		
		var settings = {
			size: {
				value: new THREE.Vector2(canvasWidth, canvasHeight) 
			},
			textel: {
				value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
			},
			znear: {
				value: near 
			},
			zfar: {
				value: far
			},
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
			focalDepth: {
				value: dvc(5.0, "feet")
			//	range: {begin: 1.00, end: 200.0, step: 5.00}
			},
			focalLength: {
				value: dvc(35.0, "mm")
			//	range: {begin: 35.0, end: 200.0, step: 20.0}
			},
			aperture: {
				value: 1.0
			//	range: {begin: 1.0, end: 12.0, step: 1.0}
			},
			coc: {
				value: dvc(0.03, "mm")
			},
			aspect: {
				value: 1.33
			},
			framesize:{
				value: 35.00
			}

		};
		//var material = new THREE.MeshDepthMaterial();
		var shader = THREE.ShaderLib["depthRGBA"];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		var material = new THREE.ShaderMaterial({ 

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms
		});
		material.blending = THREE.NoBlending;
		return {
			shader: THREE.TestShader,
			textureId: "tColor",
			settings: settings,
			material: material,
			updateCamera: function (camera) {

			 	camera.near = this.settings.znear.value;
				camera.far = this.settings.zfar.value;
				camera.frameSize = dvc(this.settings.framesize.value, "mm");
				console.log(camera.frameSize);
				camera.focalLength = this.settings.focalLength.value;

				camera.setLens(camera.focalLength, camera.frameSize);
				
				camera.updateProjectionMatrix();

			},
			updateRender: function (renderer, container) {
				//find the screen aspect ratio 
				var he = window.innerHeight;
				var wi = window.innerWidth;
				var a = wi/he;

				var aspect = this.settings.aspect.value;

				//depends on aspect of screen and aspect of user 
				//if the aspect of the screen is larger than the aspect of camera than vertical bars
				//if the aspect of the screen is smaller than the aspect of the camera than horizontal bars
	
				if (a < aspect){
					this.canvasWidth = window.innerWidth;
					this.canvasHeight = this.canvasWidth / aspect;
					this.canvasOffset = Math.max(0, 0.5 * (window.innerHeight - this.canvasHeight));
					this.aspecttype="hor";
				}
				else if (a >=aspect){
					this.canvasHeight = window.innerHeight;
					this.canvasWidth = aspect * this.canvasHeight;
					this.canvasOffset = Math.max(0, 0.5 * (window.innerWidth - this.canvasWidth));
					this.aspecttype="ver";
				}
				renderer.setSize(this.canvasWidth, this.canvasHeight);

				if (this.aspecttype == "hor"){
					container.style.left = 0.0 + "px";
					container.style.top = this.canvasOffset + "px";
					
				}
				else if (this.aspecttype == "ver"){
					container.style.left = this.canvasOffset + "px";
					container.style.top = 0.0 + "px";
				}
							

			}
		};
	};
		
	var instance = null;
	function createInstance() {

		var newInstance = new ShaderPassConfigurator();
		return newInstance;
	};

	return {
		getInstance: function () {

			if (!instance) {

				instance = createInstance();
			}
			return instance;
		}
	}
})(); 
